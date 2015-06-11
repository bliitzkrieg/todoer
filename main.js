/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    "use strict";

    /**
    * Constants
    */
    var EXTENSION_NAME = "Todoer",
        REGEX = /\/\*[\r\n\t\f ]todo::|<!--[\r\n\t\f ]*help::|[\r\n\t\f ]\*\/|[\r\n\t\f ]*-->/g;

    /**
    * Variables
    */
    var CommandManager             = brackets.getModule("command/CommandManager"),
        Commands                   = brackets.getModule("command/Commands"),
        Menus                      = brackets.getModule("command/Menus"),
        KeyBindingManager          = brackets.getModule('command/KeyBindingManager'),
        WorkspaceManager           = brackets.getModule('view/WorkspaceManager'),
        EditorManager              = brackets.getModule('editor/EditorManager'),
        ExtensionUtils             = brackets.getModule('utils/ExtensionUtils'),
        Document                   = brackets.getModule('document/Document'),
        DocumentManager            = brackets.getModule('document/DocumentManager'),
        File                       = brackets.getModule('filesystem/File'),
        FileFilter                 = brackets.getModule('search/FileFilters'),
        AppInit                    = brackets.getModule('utils/AppInit'),
        FindInFiles                = brackets.getModule('search/FindInFiles'),
        todoerIcon                 = $('<a title="' + EXTENSION_NAME + '" id="todoer-icon"></a>'),
        panelTemplate              = require('text!html/panel.html'),
        excludeFolders             = [
                                        'node_modules',
                                        'bower_components',
                                        '.min.*',
                                        '/.*/'
                                     ],
        searchQuery                = {
                                        query: 'todo::',
                                        caseSensitive: false,
                                        isRegexp: false
                                     },
        searchResults              = [],
        filter                     = FileFilter.compile(excludeFolders),
        panel,
        editor;

    /**
	 * Creates the "Todoer's bottom panel.
	 */
    function createBottomPanel() {
        panel = WorkspaceManager.createBottomPanel('bliitzkrieg.todoer.panel', $(panelTemplate), 100);
    }

    /**
     * Opens file from path
     */
    function openFile(path, line) {
        if (EditorManager.canOpenPath(path)) {
            var document = DocumentManager.getCurrentDocument();
            if (document.file._path !== path) {
                CommandManager.execute(Commands.FILE_OPEN, {
                    fullPath: path
                });
            }
        } else {
            window.alert('An error occured opening file');
        }
        editor = EditorManager.getCurrentFullEditor();
        editor.setCursorPos(line, 0, true);
    }

    /**
     * Loads external stylesheets.
     */
    function addStyles() {
        ExtensionUtils.loadStyleSheet(module, 'css/todoer.css');
    }

    /**
     * Cleans comment and removes closing comment tag for supported langauges.
     * Current support: CSS, JS, HTML, BASH
     */
    function cleanTodo(todo) {
        return todo.replace(REGEX, '').replace('<!--', '');
    }

    /**
     * Process JSON and returns array of objects
     */
    function processResults(data) {
        var results = [],
            key;

        for (key in data) {
            if (data.hasOwnProperty(key)) {
                var i;

                for (i = 0; i < data[key].matches.length; i++) {
                    var obj = {
                        todo: cleanTodo(data[key].matches[i].line),
                        path: key,
                        line: data[key].matches[i].start.line
                    };
                    results.push(obj);
                }
            }
        }
        return results;
    }

    /**
     * Clears search results
     */
    function clearSearch(results) {
        results = [];
    }

    /**
     * Sets results to panel
     */
    function setPanelWithResults(results) {
        var key,
            html = "<tr><td>Line</td><td>Todo</td><td>File</td></tr>",
            addRow = function (row) {
                return "<tr class='todo-item' data-line='" + row.line + "' data-path='" + row.path + "'>" +
                    "<td>" + row.line + "</td>" +
                    "<td>" + row.todo + "</td>" +
                    "<td>" + row.path + "</td>" +
                    "</tr>";
            };

        for (key in results) {
            if (results.hasOwnProperty(key)) {
                html += addRow(results[key]);
            }
        }

        $(".todo-table").empty().append(html);
    }

    /**
     * Searches files for todoes and sets results
     */
    function search() {
        FindInFiles.doSearchInScope(searchQuery, null, filter, null, null).then(function (x) {
            clearSearch(searchResults);
            searchResults = processResults(x);
            setPanelWithResults(searchResults);
        });
    }

    /**
     * Toggles notes bottom panel state.
     */
    function togglePanel() {
        if (panel.isVisible()) {
            panel.hide();
            todoerIcon.removeClass('active');
            CommandManager.get('bliitzkrieg.todoer.view').setChecked(false);
        } else {
            panel.show();
            todoerIcon.addClass('active');
            CommandManager.get('bliitzkrieg.todoer.view').setChecked(true);
            search();
        }
    }

    /**
     * Description: Adds menu commands.
     */
    function addMenuCommands() {
        var navigateMenu = Menus.getMenu(Menus.AppMenuBar.NAVIGATE_MENU),
            viewMenu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU),
            registerCommandHandler = function (commandId, menuName, handler, shortcut, menu) {
                CommandManager.register(menuName, commandId, handler);
                menu.addMenuItem(commandId);
                KeyBindingManager.addBinding(commandId, shortcut);
            };

        navigateMenu.addMenuDivider();

        registerCommandHandler('bliitzkrieg.todoer.view', EXTENSION_NAME, togglePanel, 'Ctrl-Alt-Shift-T', viewMenu);
    }

    /**
     * Adds a listenor that triggers the get todo function
     */
    function fileSavedHandler($event, listener) {
        search();
    }

    /**
     * Description: Adds handlers
     */
    function addHandlers() {
        todoerIcon.on('click', togglePanel).
        appendTo('#main-toolbar .buttons');

        var todoPanel = $('#todoer-panel');

        todoPanel
            .on('click', '.todo-item', function () {
            var $this = $(this);
            openFile($this.data('path'), $this.data('line'));
        })
            .on('click', '.todo-close', togglePanel);

        $(DocumentManager).on('documentSaved workingSetAdd pathDeleted', fileSavedHandler);
    }

    /**
     * Initialize the extension.
     */
    AppInit.appReady(function () {
        createBottomPanel();
        addMenuCommands();
        addStyles();
        addHandlers();
        search();
        editor = EditorManager.getCurrentFullEditor();
    });
});