/*!
 * Spin.js 1.0
 * http://spinjs.com
 * 
 * Copyright 2011, Julien Gonzalez
 *
 * Includes jQuery JavaScript Library v1.6.1
 * http://jquery.com/
 * Copyright 2011, John Resig                                                 
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license   
 *
 * Includes CSS Reset, CSS Base, CSS Fonts
 * Copyright (c) 2010, Yahoo! Inc. All rights reserved.
 * Code licensed under the BSD License:
 * http://developer.yahoo.com/yui/license.html                                               
 *
 * This file is part of Spin.js.
 *
 * Spin.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Spin.js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Spin.js.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Spin.js allows web developers to design applications as a logical
 * and continuous flow of screens.
 *
 * @author      customcommander
 * @since       1.0
 */
(function ($){    
    
//------------------------------------------------------------------------------
//-- Env (Private API) ---------------------------------------------------------
//------------------------------------------------------------------------------

    /**     
     * Env - Private API
     *
     * @name            Env
     * @namespace
     * @function
     * @private
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {Object}    [o]             Configuration object key/value pairs object literal
     * @param           {Number}    [o.minWidth]    Minimum width of a panel in pixels
     * @param           {Function}  [o.loader]      Custom loader function
     * @returns         {Object} Configuration object (may differs from the original)     
     */
    function Env(o){
        
        /*
         * Browser window width in pixels
         */
        Env.WINDOW_WIDTH = $(window).width();
        
        /*
         * Calling Env() without argument set the default environment.
         * (e.g. minWidth is 320 and loader is the default loader)
         */
        if (o===undefined || !$.isPlainObject(o)){
            o = {};
        }
        
        /*
         * If minWidth is given it must be a number.
         *
         * Spin.js imposes a soft limit for the panel width. The width cannot
         * be greater than the browser width and cannot be lower than 320.
         * 320 is the (former) width of an iPhone in vertical position.
         *
         * However Spin.js does not prevent a user from narrowing 
         * his/her browser window below 320 if he/she wants or needs to do so.
         */
        if (o.hasOwnProperty('minWidth') && $.type(o.minWidth)=='number'){
                        
            o.minWidth = Math.floor(o.minWidth); //if it's a float
            
            if (o.minWidth<320){
                o.minWidth = 320;            
            } else if (o.minWidth>Env.WINDOW_WIDTH){
                o.minWidth = Env.WINDOW_WIDTH;
            }                                
        } else {            
            o.minWidth = 320; //default value if minWidth is missing or invalid
        }
        
        Env.PANEL_MINWIDTH = o.minWidth;
        Env.MAX_COLUMNS    = Math.floor(Env.WINDOW_WIDTH / Env.PANEL_MINWIDTH);
        
        if (!Env.MAX_COLUMNS){
            Env.MAX_COLUMNS = 1;
        }
        
        Env.PANEL_WIDTH = Math.round(Env.WINDOW_WIDTH / Env.MAX_COLUMNS);
        
        /*
         * If loader is given it must be a function otherwise we trigger
         * a failure... Come on dude, loader is very important!
         */
        if (o.hasOwnProperty('loader')){            
            if (!$.isFunction(o.loader)){                
                Env.error('Loader is not a function');                
            }            
            //Overrides the default loader.
            Env.loader = o.loader;
        }    
        
        return o;                    
    }   

    
//-- Env variables -------------------------------------------------------------     

    
    /**
     * Indicates if the environment has been initialized     
     *
     * @default     false
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        Boolean
     */
    Env.initialized = false;
    
    /**
     * Absolute path to base directory that contains Spin.js
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @see         Env.initBasePath
     * @type        String
     */
    Env.BASE_PATH = null;
    
    /**
     * Browser window width in pixels     
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        Number
     */
    Env.WINDOW_WIDTH = 0;        
    
    /**
     * Computed panel width in pixels
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        Number
     */
    Env.PANEL_WIDTH = 0;
    
    /**
     * Minimum panel width in pixels
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        Number
     */
    Env.PANEL_MINWIDTH = 0;
    
    /**
     * Maximum number of columns that can be visible
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        Number
     */
    Env.MAX_COLUMNS = 0;
    
    /**
     * Reference to document body
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        jQuery Object
     */
    Env.body = null;
    
    /**
     * Reference to stack
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        jQuery Object
     */
    Env.panels = null;
    
    /**
     * Reference to previous panel control
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        jQuery Object
     */
    Env.prevCtrl = null;
    
    /**
     * Reference to next panel control
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        jQuery Object
     */
    Env.nextCtrl = null;

    
//-- Env functions -------------------------------------------------------------

    
    /**
     * Throws an Error object and displays its message into a panel.
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {String} [msg]  Error message
     * @throws          {Error}
     */
    Env.error = function (msg){
        Spin('<h2>' + msg + '</h2>', 'Error!').addClass('error');
        throw new Error(msg);
    };
    
    /**
     * Initializes Env.BASE_PATH
     *
     * <p>Finds the script tag that includes Spin.js and computes the 
     * absolute path to its base directory.</p>
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     */
    Env.initBasePath = function (){        
        //e.g. http://example.com/Spinjs/src/js/Spin.js
        var fullpath  = $('script[src*="src/js/Spin"]').prop('src'); 
        //e.g. http://example.com/Spinjs/
        Env.BASE_PATH = fullpath.substring(0, fullpath.lastIndexOf('src'));
    };
    
    /**
     * Loads Environment CSS
     * 
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     */
    Env.loadCss = function (){        
        $('head').append(
            '<link rel="stylesheet" type="text/css" href="' + Env.BASE_PATH + 'src/css/fonts-min.css" />',
            '<link rel="stylesheet" type="text/css" href="' + Env.BASE_PATH + 'src/css/reset-min.css" />',
            '<link rel="stylesheet" type="text/css" href="' + Env.BASE_PATH + 'src/css/base-min.css" />',
            '<link rel="stylesheet" type="text/css" href="' + Env.BASE_PATH + 'src/css/jKaiten.css" />'
        );
    };
    
    /**
     * Initializes Environment
     *
     * <ul>
     *      <li>Adds required HTML markup to the DOM</li>
     *      <li>Sets environment variables</li>
     *      <li>Defines events handlers</li>
     * </ul>
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {Object} [o]    Configuration object
     */
    Env.initialize = function (o){
                
        /*
         * Spin.js takes care of its own HTML markup.
         */
        $(document.body).append([
            '<div id="kaiten">',         
            '   <ol id="k-panels">',
            '       <li class="k-nav-controls">',
            '           <div id="k-nav-prev"/>',
            '           <div id="k-nav-next"/>',
            '       </li>',
            '   </ol>',
            '</div>'
        ].join(''));
        
        //Setting environment variables.
        //----------------------------------------------------------------------
        Env.body       = $(document.body);        //Body element
        Env.prevCtrl   = $('#k-nav-prev');        //Previous panel control
        Env.nextCtrl   = $('#k-nav-next');        //Next panel control
        Env.panels     = $('#k-panels');          //Panels list
        
        //Validates the configuration object
        o = Env(o);   
        
        //Loads the first panel
        Env.loader(Env.body);        
        
        //Setting events handlers.
        //----------------------------------------------------------------------
        
        $(window).resize(function (){
            var formerWidth = Env.PANEL_WIDTH;
            
            //This updates Env.PANEL_WIDTH
            Env({minWidth: Env.PANEL_MINWIDTH});
            
            //If we perform a vertical resizing only, panel & window widths
            //remain the same. Then we don't have to resize the panels.            
            if (Env.PANEL_WIDTH===formerWidth){                
                return;
            }
            
            Env.resize();
        });
        
        /*
         * This allows to define non navigable zone(s) inside a navigable zone.
         * 
         * A click on a non navigable element will not propagate.
         */
        Env.body.delegate('.no-nav', 'click', function (e){
            e.stopPropagation();
        });
        
        /*
         * A click on any element with the class "nav" or that is contained by 
         * an element with such class executes the loader. 
         * 
         * Note that any default behaviour is prevented.
         */
        Env.body.delegate('.nav', 'click', function (e){
            var elt     = $(this),
                target  = $(e.target),
                panel   = elt.closest('li.k-panel'),
                idx     = Stack.indexOf(panel);
                
            e.preventDefault();                   
                
            if (!elt.hasClass('loaded')){
                
                panel
                    .find('.loaded')
                    .removeClass('loaded');
                    
                elt
                    .removeClass('mouseover')
                    .addClass('loaded');
                
                Spin.removeAfter(panel);
                
                Env.loader(elt);                
                
            } else {                
                Spin.moveTo(
                    Stack.panel(
                        Stack.next(idx)));                
            }
            
        });                
        
        Env.prevCtrl.click(function (){
            var idx = Stack.previous(Stack.min);
            Spin.moveTo(Stack.panel(idx));            
        });
        
        Env.nextCtrl.click(function (){
            var idx = Stack.next(Stack.max);
            Spin.moveTo(Stack.panel(idx));
        });        
    };
    
    /**
     * The loader is in charge of loading the panels.
     *
     * <p>It's probably the most interesting function!</p>
     *
     * <p>The loader is executed by Spin.js each time a click is made on
     * an element with the class 'nav' and gives that element to the loader
     * as its first parameter.</p>
     *
     * <p>The very first execution of the loader occurs after the document has
     * finished to load. Its parameter at that specific time is always the
     * body element.</p>
     *
     * <p>Spin.js defines a default loader (this one) but you can override it 
     * by supplying your own to $.spin.configure().</p>
     * 
     * <pre>
     * //This is how you set you own loader
     * $.spin.configure({
     *      loader: function (elt){
     *          //your loading logic
     *      }
     * });
     * </pre>
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {jQuery Object} elt The element which has been clicked or the body when the document loads
     */
    Env.loader = function (elt){              
        /* This is how the default loader works:
         *
         * The loader assumes that each clicked element (elt) has a data-url
         * attribute and loads that url with some ajax voodoo.
         *
         * <a class="nav" data-url="mymovies.php?genre=scifi">
         *      Click here to see my sci-fi movies
         * </a>
         */
        var url = elt.data('url');
        
        //Url must be an non empty string
        url = ($.type(url)!='string' || !$.trim(url)) ? '' : $.trim(url);        

        if (!url){
            Env.error('No url given');
        }
        
        $.ajax({
            url: url,                              
            success: function (html, status, xhr){            
                Spin(html, elt.getPanelTitle());                    
            },
            error: function (xhr, status, error){                
                Env.error(xhr.status + ' ' + error);
            }
        });
    };   
    
    /**
     * Environment Resize.
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0  
     */
    Env.resize = function (){
        var idx = 0,
            n   = Stack.size(),
            newMin,
            newMax,
            pos;
        
        newMin = Stack.max - Env.MAX_COLUMNS + 1;
        
        if (newMin<0){
            newMin = 0;
            // Stack.max is updated if there are not enough panels before the last
            // (and including the last) to occupy the browser window and if there
            // are panels available after the last.
            newMax = (Stack.max+1===n) ? Stack.max : Env.MAX_COLUMNS - 1;
            pos    = 0;
        } else {
            newMax = Stack.max;
            pos    = (newMin===0) ? 0 : newMin * -Env.PANEL_WIDTH;
        }
        
        for (; idx<n; idx++){            
            Stack.panel(idx).css({
                left:   Math.ceil(pos),
                width:  Env.PANEL_WIDTH
            });
            pos += Env.PANEL_WIDTH;
        }
        
        Stack.min = newMin;
        Stack.max = newMax;
        
        Env.togglePrevNextControls();
    };  
    
    /**
     * Shows or hides previous/next controls
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     */
    Env.togglePrevNextControls = function (){        
        if (Stack.previous(Stack.min)<0){
            Env.prevCtrl.hide('fast');
        } else {            
            Env.prevCtrl.show('fast');
        }
        if (Stack.next(Stack.max)<0){
            Env.nextCtrl.hide('fast');
        } else {
            Env.nextCtrl.show('fast');
        }
    };
        
//------------------------------------------------------------------------------
//-- Stack (Private API) -------------------------------------------------------
//------------------------------------------------------------------------------
 
    /**
     * Adds a panel to the Stack.
     * 
     * <p>Adds a panel and updates visible range boundaries.</p>
     *
     * @private
     * @name            Stack
     * @namespace     
     * @function
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {jQuery Object} panel The panel to add to the Stack
     */
    function Stack(panel){
        var idx = Stack.push(panel);
        
        //first panel
        if (idx===0){
            Stack.min = 0;
            Stack.max = 0;
            
        //if index is still visible it becomes the new max boundary
        //(we don't need to care if it isn't.)
        } else if (Stack.visible(idx)) {
            Stack.max = idx;                        
        }
        
        return idx;
    }
    
//-- Stack variables -----------------------------------------------------------

    /**
     * Array of panels IDs
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @type            String[]
     */
    Stack.arr = [];
    
    /**
     * Begin of visible range. (Panels with indexes lower than Stack.min are
     * not visible.)
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @type            Number
     */
    Stack.min = -1;
    
    /**
     * End of visible range. (Panels with indexes greater than Stack.max are 
     * not visible.)
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @type            Number
     */
    Stack.max = -1;
    
    /**
     * Autoincremented ID
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @type            Number
     */
    Stack.nextId = 1;
    
//-- Stack functions -----------------------------------------------------------
    
    /**
     * Returns the number of panels in the Stack
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @returns         {Number}
     */
    Stack.size = function (){
        return Stack.arr.length;
    };
    
    /**
     * Appends the panel to the DOM and to the Stack.
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @returns         {Number} Panel Stack index
     */
    Stack.push = function (panel){           
        Env.panels.append(panel);                
        Env.body.trigger('paneladd.k', [panel]);        
        return Stack.arr.push(panel.attr('id')) - 1;
    };
    
    /**
     * Removes the last panel from the DOM and from the Stack.
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     */
    Stack.pop = function (){
        var id    = Stack.arr.pop(),
            panel = $('#' + id).remove();            
        Env.body.trigger('panelremove.k', [panel]);
    };
    
    /**
     * Returns the panel Stack index.
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {jQuery Object} panel
     * @returns         {Number} Panel Stack index
     * @throws          {Error} An Error is thrown if panel is not valid or unknown
     */
    Stack.indexOf = function (panel){
        var idx;      
            
        if (!(panel instanceof jQuery) || !panel.is('li.k-panel')){
            Env.error('No panel given');
        }
        
        idx = $.inArray(panel.attr('id'), Stack.arr);
        
        if (idx<0){
            Env.error('Panel Not Found');
        }
        
        return idx;
    };
    
    /**
     * Returns the next panel ID
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @returns         {String} Panel ID
     */
    Stack.id = function (){        
        return 'panel_' + Stack.nextId++;        
    };
    
    /**
     * Returns the next panel position
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @returns         {Number}
     */
    Stack.position = function (){
        if (Stack.min<0){/*i.e. the first panel*/
            return 0;
        }        
        return (Stack.max - Stack.min + 1) * Env.PANEL_WIDTH;
    };
    
    /**
     * Returns panel at given Stack index
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {Number} idx Stack index
     * @returns         {jQuery Object} Panel
     */
    Stack.panel = function (idx){
        return $('#' + Stack.arr[idx]);
    };            
    
    /**
     * Returns previous Stack index 
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {Number} idx Stack index
     * @returns         {Number} previous Stack index or -1
     */
    Stack.previous = function (idx){        
        return (--idx<0) ? -1 : idx;
    };
    
    /**
     * Returns next Stack index
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {Number} idx Stack index
     * @returns         {Number} next Stack index or -1
     */
    Stack.next = function (idx){        
        return (++idx>=Stack.size()) ? -1 : idx;
    };
    
    /**
     * Returns true if Stack index is within visible range
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {Number} idx Stack index
     * @returns         {Boolean} false if not within visible range
     */
    Stack.visible = function (idx){        
        return (idx>=Stack.min) && (idx<=(Stack.min + Env.MAX_COLUMNS - 1));
    }; 
    
    /**
     * Returns the number of visible panels.
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @returns         {Number}
     */
    Stack.numVisible = function (){
        return Stack.max - Stack.min + 1;
    };
    
    /**
     * Removes all panels after and including given Stack index
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {Number} idx Stack index
     */
    Stack.remove = function (idx){
        var i = 0, 
            n = Stack.size() - idx; 
            
        for (; i<n; i++){        
            Stack.pop();                        
        }   
        
        Stack.max = Stack.previous(idx);   
    };   
    
//------------------------------------------------------------------------------
//-- Spin (Public API) ---------------------------------------------------------
//------------------------------------------------------------------------------
            
    /**
     * <p>Creates and appends a panel</p>
     *
     * @example
     * //Creates and appends a panel with no content and no title
     * $.spin();
     *
     * @example
     * //Creates from HTML string
     * $.spin('&lt;p&gt;Hello World&lt;/p&gt;', 'Hello');
     *
     * @example
     * //Creates from jQuery object
     * var html = $('&lt;p&gt;Hello World&lt;/p&gt;');
     * $.spin(html, 'Hello');
     *
     * @example
     * //Adds content after the panel is returned
     * var panel = $.spin();
     * panel.panelBody('&lt;p&gt;Hello World&lt;/p&gt;');
     * 
     * @public
     * @name            $.spin
     * @namespace       
     * @function
     * @author          customcommander
     * @since           1.0
     * @version         1.0     
     * @param           {String|jQuery Object}  [html]  Content of the panel. Either a HTML string or a jQuery object.
     * @param           {String}                [title] Title of the panel
     * @returns         {jQuery Object} The panel that has been created
     */
    function Spin(html, title){
        var panel, 
            panelId       = Stack.id(),            
            panelSelector = '#' + panelId,                        
            script,
            i,      //control var 
            n,      //control var
            js; 
            
        /**
         * If the html parameter is given it must be either a string
         * or a jQuery object.
         */
        if (html && $.type(html)!='string' &&  !(html instanceof jQuery)){
            Env.error('String or jQuery object expected');
        }
        
        /**
         * Converts the html parameter to a jQuery object if it was not
         * already.
         */
        if (!(html instanceof jQuery)){
            html = $(html);
        }
        
        /**
         * If the title parameter was not given, we set it to an empty string.
         * Otherwise the string 'undefined' will be displayed.
         */
        if (title===undefined){
            title = '';
        }
            
        //Base markup of a panel
        panel = $([
            '<li class="k-panel">',
            '   <div class="k-panel-hd">',
            '       <span class="k-title">' + title + '</span>',
            '   </div>',
            '   <div class="k-panel-bd"/>',
            '</li>'
        ].join(''));
        
        //Identifying, sizing and positioning
        panel
            .attr('id', panelId)
            .css({
                left: Stack.position(),
                width: Env.PANEL_WIDTH
            });
        
        /**
         * We append to the panel the html without any <script/> nodes.
         * For reason explained below these nodes must added to the DOM
         * separately.
         */
        panel.find('div.k-panel-bd').append(html.filter(':not(script)'));                        
       
        //Adds the panel to the DOM
        Stack(panel);
        
        //Gets all <script/> nodes from the original html.
        script = html.filter('script');
        
        if (script.length){
            
            js = [];          
            
            for (i=0, n=script.length; i<n; i++){
                
                /**
                 * We reinject the JavaScript defined between <script></script>
                 * into an anonymous function which "this" value is set to 
                 * the panel that we just have created.
                 * 
                 */                
                js.push([                    
                    '(function (){',                        //<-- anonymous function       
                        script.eq(i).text(),                //<-- reinjecting code
                    '}).call($("' + panelSelector + '"));'  //<-- setting "this" to the panel
                ].join(''));
            }
            
            /**
             * Adding JavaScript to the DOM after the addition of the panel
             * to the DOM.
             * 
             * We have to do that in order to allow the JavaScript to access 
             * elements defined in the panel.
             * 
             * If the JavaScript has no need to access such elements, it is
             * not necessary to do that but in the other hand we cannot predict
             * what your code does ;-)
             * 
             */
            Env.body.append([
                '<script type="text/javascript">',
                    js.join(''),
                '</script>'
            ].join(''));
        }
        
        //Moves to the panel if not visible
        Spin.moveTo(panel);
        
        return panel;
    }    
    
    /**
     * Allows to configure Spin.js before it runs.
     * 
     * The function is designed to be executed only once. Further calls will
     * have no effect.
     * 
     * Parameter 'o' is a key/value pairs literal object.
     *
     * @function
     * @name        $.spin.configure     
     * @extends     $.spin
     * @param       {Object}    [o]             key/value pairs object literal
     * @param       {Number}    [o.minWidth]    The minimum width of a panel (expressed in pixels)
     * @param       {Function}  [o.loader]      Your own loader function
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     */
    Spin.configure = function (o){
        if (!Env.initialized){
            $(function (){
                Env.initialize(o);
            });   
            Env.initialized = true;         
        }
    };
    
    /**
     * Moves to given panel
     * 
     * Performs a "horizontal scrolling" (left or right) 
     * until given panel gets visible.     
     *
     * @function
     * @name        $.spin.moveTo
     * @extends     $.spin
     * @param       {jQuery Object} destPanel   The panel to where you need to go.
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     */
    Spin.moveTo = function (destPanel){        
        var destIdx = Stack.indexOf(destPanel), //destination index
            arr     = Stack.arr,            
            css     = {left: ''},
            elts    = [],
            panel,
            idx,            
            newMin,
            newMax;
        
        if (Stack.visible(destIdx)){            
            //if panel already is visible we dont need to move there...
            return destPanel;
        }        
        
        if (destIdx>Stack.max){            
            
            // SITUATION
            // *********
            // 1) Panels 2 to 4 are visible but we need to move to panel 8.
            // 2) Panels width is set to 100 (PANEL_WIDTH).
            // 3) Only three panels can be visible (MAX_PANELS).                    
            //
            // current: -200-100 0   100 200 300 400 500 600
            //          +---+---+---+---+---+---+---+---+---+
            //          | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
            //          |   |   |min|   |max|   |   |   |   |            
            //          +---+---+---+---+---+---+---+---+---+
            //
            // new:     -600-500-400-300-200-100 0   100 200
            //          +---+---+---+---+---+---+---+---+---+
            //          | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
            //          |   |   |   |   |   |   |min|   |max|
            //          +---+---+---+---+---+---+---+---+---+            
            css.left = '-=' + Math.round(((destIdx - Stack.max) * Env.PANEL_WIDTH));                            
            newMin   = destIdx - Env.MAX_COLUMNS + 1;  // 8 - 3 + 1 = 6
            newMax   = destIdx;                     // 8
            
            //from 2 to (and including) 8
            for (idx=Stack.min; idx<=newMax; idx++){              
                
                panel = Stack.panel(idx); 
                elts.push(panel.get(0));
                
                //before we animate panels 2 to 8, we have to be sure that they
                //are all correctly positioned. since they already are visible
                //panels 2 to 4 dont need this.
                if (idx>Stack.max){                        
                    
                    //panel 5 is positioned at : (5 - 2) * 100 = 300
                    //panel 6 is positioned at : (6 - 2) * 100 = 400 ...
                    panel.css({left: Math.round((idx - Stack.min) * Env.PANEL_WIDTH)});                    
                }                
            }            
            
        } else if (destIdx<Stack.min){
            
            css.left = '+=' + Math.round(((Stack.min - destIdx) * Env.PANEL_WIDTH));
            newMin   = destIdx;
            newMax   = destIdx + Env.MAX_COLUMNS - 1;
            
            for (idx=destIdx; idx<=Stack.max; idx++){                                  
                
                panel = Stack.panel(idx);
                elts.push(panel.get(0));                                                       
                
                if (idx<Stack.min){                                                            
                    panel.css({left: Math.round((idx - Stack.min) * Env.PANEL_WIDTH)});                    
                }
            }                        
        }   
        
        //updating boundaries
        Stack.min = newMin;
        Stack.max = newMax;                          
        
        $(elts).animate(css, 'fast');   
        
        Env.togglePrevNextControls();
        
        return destPanel;
    };        
    
    /**
     * Removes all panels (visible or not) after given panel.
     *
     * @function
     * @name            $.spin.removeAfter
     * @extends         $.spin
     */
    Spin.removeAfter = function (panel){
        var idx     = Stack.indexOf(panel), //panel index
            nextIdx = Stack.next(idx);      //next panel index
            
        //nextIdx<0 means that current panel was the last panel
        if (nextIdx>0){                        
            //removes everything starting from nextIdx.
            Stack.remove(nextIdx);            
        }        
    };
    
    /**
     * Moves to the panel that is on the left of the first panel and returns it.
     * 
     * If 'move' is set to false the function simply returns the panel.
     * Any other value will be disregarded.
     * 
     * If there is no such panel the function returns false.
     *
     * @function
     * @name            $.spin.previous
     * @extends         $.spin
     */
    Spin.previous = function (move){
        var idx = Stack.previous(Stack.min),
            panel;                            
        
        if (idx<0){
            return false;
        }        
        
        panel = Stack.panel(idx);        
        
        if ($.type(move)=='boolean' && !move){
            return panel;
        }        
        
        return Spin.moveTo(panel);        
    };        
    
    /**
     * Moves to the panel that is on the right of the last panel and returns it.    
     * 
     * If 'move' is set to false the function simply returns the panel.
     * Any other value will be disregarded.
     * 
     * If there is no such panel the function returns false.
     *
     * @function
     * @name            $.spin.next
     * @extends         $.spin
     */
    Spin.next = function (move){
        var idx = Stack.next(Stack.max),
            panel;
        
        if (idx<0){
            return false;
        }
        
        panel = Stack.panel(idx);
        
        if ($.type(move)=='boolean' && !move){
            return panel;
        }        
        
        return Spin.moveTo(panel);        
    };   
    
    /**
     * Returns the current number of columns on display.
     *
     * @function
     * @name            $.spin.numColumns
     * @extends         $.spin
     */
    Spin.numColumns = function (){
        return Stack.numVisible();
    };
    
    /**
     * If called without parameter, it returns the current maximum number of
     * columns that can be displayed at the same time.
     * 
     * If the parameter is set it redefines that number and the display will
     * be updated accordingly.
     * 
     * Note that Spin.js tries to keep the panels to a minimum of 
     * 320px wide each and by doing so, imposes a soft limit on that number.
     * 
     * Returns the maximum number of columns.
     *
     * @function
     * @name            $.spin.maxColumns
     * @extends         $.spin
     */
    Spin.maxColumns = function (n){
        var max;
        
        //Call without argument
        if (n===undefined){
            return Env.MAX_COLUMNS;
        }
        
        n = parseInt(n, 10);
        
        if (!n || n<0){
            Env.error('Invalid number of columns');
        }
        
        //maximum number of columns if panel width is set to 320
        max = Math.floor(Env.WINDOW_WIDTH / 320);
        
        if (!max){
            max = 1;
        }
        
        /**
         * if n is greater than max, it means that panel width is lower than 
         * 320. Spin.js doesn't like that.
         */
        if (n>max){
            n = max;
        }
        
        K({minWidth: Math.floor(Env.WINDOW_WIDTH / n)});
        
        Env.resize();
        
        return n;
    };
    
    /**
     * Returns Spin.js Installation Path
     *
     * @function
     * @name            $.spin.basePath
     * @extends         $.spin
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @see             Env#initBasePath
     * @returns         {String}
     */
    Spin.basePath = function (){
        return Env.BASE_PATH;
    };
    
    Env.initBasePath();
    Env.loadCss();
    
    $(function (){
        if (!Env.initialized){
            Env.initialize();                    
        }
        Env.initialized = true;
    });
    
    /**
     * Helper - Returns panel (jQuery Plugin)
     *
     * Returns the panel of the first matched element in the set.
     * Triggers a failure if it can't find it.
     */
    $.fn.getPanel = function (){
        var panel;
        
        if (this.hasClass('k-panel')){
            panel = this;
        } else {
            panel = this.closest('li.k-panel');
        }
        
        if (!panel.length){
            Env.error("Can't find your panel");
        }
        
        return panel;
    };
    
    $.fn.panelBody = function (html){
        var body;
        
        if (!this.is('li.k-panel') ||
            (html && $.type(html)!='string' && !(html instanceof jQuery))){
            return;
        }
        
        body = this.find('div.k-panel-bd');
        
        if (html){
            html = (html instanceof jQuery) ? html : $(html);
            body.html(html);
        }
        
        return body
    };
    
    /**
     * Helper - Returns panel title (jQuery Plugin)
     */
    $.fn.getPanelTitle = function (){        
        /**
         * If called from a navigable element the plugin returns the title
         * of the panel that will be loaded. 
         *
         * There are different ways to find it.
         */
        if (this.hasClass('nav') || this.is('body')){
            /**
             * 1) Looking for a data-title attribute:
             *
             * <a class="nav" data-title="Sci-fi movies">
             *      See my Sci-fi movies
             * </a>
             *
             * Returns 'Sci-fi movies'
             */
            if (this.data('title')){
                return this.data('title');
            /**
             * 2) If the navigable element also has the class 'k-title' it
             * returns its text:
             *
             * <a class="nav k-title">
             *      My Sci-fi movies
             * </a>
             *
             * Returns 'My Sci-fi movies'
             */
            } else if (this.hasClass('k-title')){
                return this.text();
            /**
             * 3) Looking for a child of the navigable element that has the 
             * class 'k-title':
             *
             * <div class="nav">
             *      <span class="k-title">Blade Runner</span>
             *      <img src="bladerunner.jpg" alt="Blade Runner"/>
             * </div>
             *
             * Returns 'Blade Runner'
             */
            } else if (this.find('.k-title').length){
                return this.find('.k-title').eq(0).text();
            /**
             * 4) Finally it returns the text of the navigable element
             *
             * <a class="nav">
             *      Sci-fi movies
             * </a>
             *
             * Returns 'Sci-fi movies'
             */
            } else {
                return this.text();
            }
        /**
         * Otherwise it just returns the title of the panel that contains the
         * element.
         */
        } else {
            return this.getPanel()
                .find('div.k-panel-hd')
                    .find('span.k-title')
                        .text();
        }
    };
    
    /**
     * This is a "gift" to developers if they want to use the internal 
     * Env.error function and if they are happy with its design.
     *
     * Developers can re-override $.error later without affecting Env.error.
     */
    $.error = Env.error;
    
    /**
     * Extends jQuery with Spin.js public API
     * 
     * Usage:    
     * 
     * $.spin();
     * $.spin.configure();     
     * $.spin.next();
     * $.spin.previous();
     * $.spin.moveTo();     
     * $.spin.removeAfter();
     * $.spin.maxColumns();
     */
    $.extend({spin: Spin});
    
    //jQuery is awesome!!!
}(jQuery));
