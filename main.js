/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    "use strict";
    
    /**
    * Constants
    */
    
    var EXTENSION_NAME = "Todoer";
    
    /**
    * Variables
    */   
    var CommandManager     = brackets.getModule("command/CommandManager"),
        Menus              = brackets.getModule("command/Menus"),
        KeyBindingManager  = brackets.getModule('command/KeyBindingManager'),
        WorkspaceManager   = brackets.getModule('view/WorkspaceManager'),
        ExtensionUtils     = brackets.getModule('utils/ExtensionUtils'),
        AppInit            = brackets.getModule('utils/AppInit'),
        todoerIcon         = $('<a title="' + EXTENSION_NAME + '" id="todoer-icon"></a>'),
        panelTemplate      = require('text!html/panel.html'),
        panel;
    
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
	 * Creates the "Todoer's bottom panel.
	 */
	function createBottomPanel() {
		panel = WorkspaceManager.createBottomPanel('bliitzkrieg.todoer.panel', $(panelTemplate), 100);
	}
    
    /**
     * Description: Adds event listeners.
     */
    function addHandlers() {
        todoerIcon.on('click', togglePanel).
            appendTo('#main-toolbar .buttons');
    }
    
    function togglePanel() {
    }
    
    /**
     * Loads external stylesheets.
     */
    function addStyles() {
        ExtensionUtils.loadStyleSheet(module, 'css/todoer.css');
    }
    
    /**
     * Description: Initialize the extension.
     */
    AppInit.appReady(function () {
        createBottomPanel();
        addMenuCommands();
        addStyles();
        addHandlers();
       // if (localStorage.getItem('georapbox.notes.visible') === 'true') {
        //    togglePanel();
       // }
    });
});