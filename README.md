# What is Html Enhancer?
Html Enhancer was conceived after years of frustrations spent trying to 
enrich my Html with widgets and plugins written by various authors and based on different technologies. 
I am speaking of:
- problems caused by the wrong order plugins are applied to their target Html
- panic when the same plugins must be applied also to the Html created dynamically or received by ajax calls. 
In fact, putting everything in the jQuery.ready(...) is easy...but then we have to re-implement a similar code each time we
create dynamic content! Several jQuery widgets automatically enhance our Html at the price of almost no programming effort, 
thanks to data- attributes and to a document parsing performed on the document ready event, but then all these tranformations are not automatically applied also to dynamic content!

It would be nice to decide once and for all the kind of transformations to apply to our html, and their order, 
and then having them applied automatically to all our pages, and dynamic content.

It would be nice to coordinate easily modules loaded asynchronously and modules loaded sinchronously,
so that they apply in the right order!

So after years of frustrastions I decided to solve the problem once and for all, by creating an unique 
centralized registry of all Html transformations/widgets that receives an unique options object that feeds all 
registred modules.

mvcct-enhancer has no dependency on other js libraries and comes with just a single transformation module that applies a minimal fallback for Html5 inputs that either are 
not supported by the browser or that the developer would like to substitute with widgets. Adding other transformations is as easy as:
1. writing simple wrappers around already existing modules
2. registering the wrapped module by calling the `.register(...)` method.

**mvcct-enhancer, is available both on bower, and npm.**

## Html Enhancer with pure synchronous javascript loading
```

    <script type="text/javascript" src="mvcct.enhancer.js" />
    <script type="text/javascript" src="lib1.js" />
    <script type="text/javascript" src="lib2.js" />
    
    
    <!--in actual applications the code below should be enclosed into another .js 
    file at the end of the body
    -->
    <script type="text/javascript">
        mvcct.enhancer.register(lib1Transform, 
            true, 
            lib1ProcessOptions, 
            "lb1DebugName", 
            lib1OptionalPreProcessOptions);
        mvcct.enhancer.register(lib2Transform, 
            true, 
            lib2ProcessOptions, 
            "lb1DebugName", 
            lib2OptionalPreProcessOptions);
        var myOptions{
            //MyOptions definition
        };
        mvcct.enhancer.init(myOptions);
    </script>   
    
   ```
Then each time you create new dynamic html nodes just call 
`mvcct.enhancer.transform(node)` on the root node(s).

Transformations are applied in the order they are registred, so we may decide once and 
for all their order in the .js file that defines all registrations and options. 

After the .init method is called a three stages processing occurs:
1. **Pre-processing stage**. If available the PreProcessOption function of each module
is called. In this stage each transformation module has the opportunity to offer services to other 
modules by setting the property of the option object used by that nodules.
2. **Processing options stage**. Each module configures itself based on the sections of
options object destined to it.
3. **Transformation stage**. All transformations are applied to the initial content of the page. 

`lib1Transform`, `lib2Transform` define the actual transformations 
to be applied. They receive two arguments: the root node of the chunk to transform and 
a boolean that is `true` for the initial static page transformation and `false`
for dynamic Html transformations.

When the second argument is set to `true` the transformation is applied to both the initial static Html, 
and to dynamic content. When it is set to `false`the transformation is applied just to
dynamic content. 
This option maybe usefull for modules that automatically apply their transformation
on the document ready event. **IMPORTANT!** This technique interferes with the main purpose 
of centralizing the place where to define the order of application of all transformations.
**Therefore**, as a default, the jQuery document ready event is intercepted and "blocked".
This block may be removed by setting the `runReady` property of the options object to `true`.   
In any case all functions registred on the document raedy event will be executed only after the 
option processing stage, during the transformation stage.   

`lib1ProcessOptions`, `lib1ProcessOptions` are the functions that define the option processing
of each module. They receive the options object as their unique argument.

`lb1DebugName`, `lb2DebugName`, are names used in error messages when a javascript error occurs 
during a transformation.  

`lib1PreProcessOptions`, `lib2PreProcessOptions`, are the functions that define the pre-processing
of each module. They receive the options object as their unique argument.

## Html Enhancer with mixed synchronous and asynchronous javascript loading

When we have a foundamentally synchronous loading with just a few async loaded modules
we may adopt the following technique:

```
<script type="text/javascript" src="mvcct.enhancer.js" />
    <script type="text/javascript" src="lib1.js" />
    <script type="text/javascript" src="lib2.js" />
    
    <script data-main="scripts/main" src="scripts/require.js"></script>
    
    <!--in actual applications the code below should be enclosed into another .js -->
    <script type="text/javascript">
        mvcct.enhancer.register(lib1Transform, 
            true, 
            lib1ProcessOptions, 
            "lb1DebugName", 
            lib1OptionalPreProcessOptions);
        mvcct.enhancer.register(asynclib1Transform, 
            true, 
            asynclib1ProcessOptions, 
            "asynclb1DebugName", 
            asynclib1OptionalPreProcessOptions);
        mvcct.enhancer.register(asynclib2Transform, 
            true, 
            asynclib2ProcessOptions, 
            "asynclb1DebugName", 
            asynclib2OptionalPreProcessOptions);
        mvcct.enhancer.register(lib2Transform, 
            true, 
            lib2ProcessOptions, 
            "lb1DebugName", 
            lib2OptionalPreProcessOptions);
        var myOptions{
            //MyOptions definition
        };
        mvcct.enhancer.waitAsync(myOptions);
    </script>
```
`waitAsync` delays initialization till async loading has been completed.

Async modules are registred together with sync modules, and also in this case 
transformations are applied in the order they are registred. All functions used in
the registration of async modules are on-line wrappers around the actual functions 
that are being loaded asynchronously. For eaxample `asynclib1Transform` will be 
something like: 

```
function(options, init){
    allAsyncs.asynclib1.transform(options, init);
}
```
In the main.js we have something like:

```
define(["..../asynclib1", ...],
    function(asynclib1, ...) {
        var allAsyncs=window.allAsyncs={};
        allAsyncs.asynclib1=asynclib1;
        ....
        mvcct.enhancer.asyncReady();
        ...
    }
);
```
There, we first define the actual functions invoked in the registration, and then
we inform the enhancer module async loading has been completed by calling `asyncReady`.

## Html Enhancer with asynchronous javascript loading

```
define(["..../asynclib1", "..../asynclib2", ..., ".../mvcct.enhancer, ..."],
    function(asynclib1, asynclib2, ..., enhancer, ... ...) {
        enhancer.register(asynclib1.Transform, 
            true, 
            asynclib1.ProcessOptions, 
            "asynclb1DebugName", 
            asynclib1.PreProcessOptions);
        enhancer.register(asynclib2.Transform, 
            true, 
            asynclib2.ProcessOptions, 
            "asynclb1DebugName", 
            asynclib2.PreProcessOptions);
        ....
        var myOptions{
            //MyOptions definition
        };
        document.addEventListener('DOMContentLoaded', function(){ 
            enhancer.init(myOptions);
        }, false);        
        ...
    }
);
```
The avove code may be inserted either directly in the main.js or in a specfific 
transformations registration module.

**IMPORTANT!** Our examples used just AMD style async loading, but mvcct.enhancer supports
also CommonJs/Node.Js loading.

## TypeScript support
The distribution contains the .d.ts header file needed to use mvcct enhamcer with TypeScript.  

## Htm5 inputs support-detection and fallback module
When the enhancer is loaded it automatically computes the browser support of all Html5 input fields. 
This info may be obtained with the mvcct.enhancer call: `getSupport().Html5InputOriginalSupport`. 
The `Html5InputOriginalSupport` property contains the object:

```
        {   
            number: true/false;
            range: true/false;
            date: true/false;
            month: true/false;
            week: true/false;
            time: true/false;
            datetime: true/false;
            email: true/false;
            search: true/false;
            tel: true/false;
            url: true/false;
            color: true/false;
        }
```
Where `true` means the input type is supported.
As a default no fallback attempt is performed. However, if the `mvcct.enhancer.input.basic.js` basic 
fallback module is loaded and registered by calling the mvcct.enhancer method `addBasicInput(Globalize)`, 
then Html5 fallback is automatically turned on. and all Html5 inputs that are not supported are transformed 
into text inputs and their content is converted into the current "locale" (this means, for instance, that dates are transformed 
from the date input ISO format into a format like mm/dd/yy). Moreover, if version >= 1.0.2 the original input type
is stored in the `data-original-type` attribute.

Available, also a more complete fallback based on bootstrap widgets: [bootstrap-html5-fallback](https://github.com/MvcControlsToolkit/bootstrap-html5-fallback). 
When `bootstrap.html5.fallback.js` is loaded after `mvcct.enhancer.input.basic.js` the `addBasicInput(Globalize)`
is updated to load also all bootstrap widgets.

As a default the following [Globalize](https://github.com/jquery/globalize) "locale" formats are used: 

```
{
     dateFormat: { "date": "short" },
     timeFormat: { "skeleton": "Hms" },
     timeFormat1: { "skeleton": "Hms" },
     datetimeFormat: { "datetime": "short" },
     datetimeFormat1": { "datetime": "short" },
     monthFormat: { "date": "short" },
     weekFormat: { "date": "short" }
};
```

However, they may be customized bay passing a similar object, containing just the property to customize in the `editFormats` options property.

The `addBasicInput` must be passed a [Globalize](https://github.com/jquery/globalize) object, that is needed for the above transformations.
The basic fallback module adds also some keyboard control to all numeric fields, so that the user may insert just digits, 
decimal separators and +/- chars. The `min` attribute is used to verify if the number may be negative, and accordingly if 
+/- chars must be accepted. The developer may provide extra information about the number type with the `data-val-correcttype-type` attribute:
1 positive integer, 2 integer, 3 float.

Html5 fallback may be turned on also manually by setting the `browserSupport.fallbackHtml5` options field to `true`, without registering any extra module, in which case 
the only effect will be the conversion of all not supported inputs into text inputs wih no further processing.


`getSupport().Html5InputSupport`, instead contains informations also on possible fallbacks provided:

```
        {
            number: number;
            range: number;
            date: number;
            month: number;
            week: number;
            time: number;
            datetime: number;
            email: number;
            search: number;
            tel: number;
            url: number;
            color: number;
        }
```
Four integer values are used: 1 no support, 2 not ISO fallback, 3 ISO fallback, 4 native support.

Iso fallback means that numbers and dates/time are stored in the input field in exactly the same format of 
native input type (international ISO format). not ISO fallback is the most common, since most of available widgets use
current "locale" formats(ie mm/dd/yy like dates).

A value of, say 3 doesn't mean necessarely that the browser has no native support since the developer may force the 
usage of the available fallback.
The developer may declare the provided fallback by putting in the options object property `browserSupport.fallbacks` an object like the one below:

```
        {
            number: 
                {
                    force: true/false,
                    type: 1..3
                },
            range?: ...,
            date?: ...,
            month?: ...,
            week?: ...,
            time?: ...,
            datetime?: ...,
            email?: ...,
            search?: ...,
            tel?: ...,
            url?: ...,
            color?: ...,
        }
```
Setting `force` to true forces the usage of the available fallback, while type specifies the type of the  
provided fallback.

All well written fallback modules shoud automatically set the type in the pre-processing stage(The mvcct.enhancer.basic.input module do it!).
## Time zone processing (starting from version 1.0.2)
If a `datetime-local` input has the attribute `data-is-utc="true"`, then its value is assumed to be an UTC date/time. This value is converted 
into the local time zone during the input processing stage. Moreover, it is assumed that the element after the `datetime-local` input is an input type "hidden"
where to store the date/time time-zone offset (that in general depends on the specific date/time value). 
Accordingly, each time the input field is modified by the user, this associated input field is automatically 
updated with the time zone offset of the newly inseted value. 
## Reading and setting input values
Since input formats for native support and fallback might differ, support checks must be done 
when reading/setting input fields. In order to simplify input field access, when it is loaded, 
the Htm5 inputs support-detection and fallback module adds two helper methods to the enhancer object, namely:

```
.format(type, value, [invariant]) 
.parse(type, stringValue, [invariant])

```
Both methods takes the type of the original Html5 input as first argument("date", "time", etc.). `format` 
takes a javascript object (date or number depending on the input time) and transforms it in a properly formatted 
string, while `parse` performs the inverse transformation. I case of fallback the formats specified in 
`editFormats`(or their defaults) are used. If the third optional argument is true parsing/formatting are 
done using the invariant culture (the one used by native Html5 inputs), otherwise the right culture is auto-detected.
Forcing the invariant culture may be useful for some custom processing of the original input field (for instance 
processing min/max or step attributes to set some fallback widget options). 

## Adding widgets to Htm5 input fallback
One may also add easily widgets(date, datetime, time pickers, siders, etc) to the basic input fallback, 
by adding to the options property `browserSupport.handlers.enhance` an object like:

```
        {
            number: function(node){.... return;},
            range: function(node){.... return;},
            date: function(node){.... return;},
            month: function(node){.... return;},
            week: function(node){.... return;},
            time: function(node){.... return;},
            datetime: function(node){.... return;},
            email: function(node){.... return;},
            search: function(node){.... return;},
            tel: function(node){.... return;},
            url: function(node){.... return;},
            color: function(node){.... return;},
        }
```
Each of the above functions will be automatically invoked on the corresponding input type after fallback, and can be used to enhance 
the node with a widget. For instance, we may add a datepicker:

```
...
date: function(node){
    $(node).datepicker(options.browserSupport.dateOptions);
},
...

```
It is good practice to take widgets options from the overall mvcct.enhancer options object. 
One may also define all widgets for a given javascript framework (such Bootstrap for instance), 
in a module that is registred in mvcct.enhancer. A similar module should contain just a pre-process 
function that populates the `browserSupport.handlers.enhance` of the options object.
 
## Sending Htm5 inputs support information to the server
mvcct.enhancer may package both the information contained in `getSupport().Html5InputSupport` and in `getSupport().Html5InputOriginalSupport` 
in a cookie and/or in an hidden field, so that they are automatically sent to the server that may use them 
to interpret all values returned by the input fields. Infact, the format of numbers and dates are returned changes 
in case of fallback of type 2.
In order to enable hidden field/cookie packaging it is enough to fill the options object properties `browserSupport.cookie` 
and/or `browserSupport.forms` with the name of the cookie/hidden field. In case the Html document contains several forms the hidden field is 
added to all of them.

Both property data are inserted in the same array as key value pairs:
```
[
    {Key: 'Html5InputSupport.number', Value: 2},
    ....
    {Key: 'Html5InputOriginalSupport.number', Value: false}
    ....
]
    
```
Then, they are serialized into a jSon strings, and, just for the cookie, also url-encoded.



## Dependencies propagation module
In order to help registred modules to enhance Html, mvcct.enhancer provides a simple dependency propagation engine.
We may declare that an input node input1 depends on input2, according to a function f(). After that each time input 2
changes (becuase of an user action) f() will be invoked on input1, then all inputs depending on input1 will have their f() invoked, and so on.
Infinite loops are prevented by stopping the propagation when it returns on an already visited node.

A dependency is declared with the following mvcct.enhancer method:

```
dependency(name,//string
           sourceNode, //tracked node
           targetNode, //dependent node
           eventNames: //array containing the names of all 
                       //events that will trigger the propagation(ie ['blur', 'keypress'...], etc
           action: // invoked function function(targetNode, sourceNode) => void); 
)
```
`name` identifies the type of dependency. If you want your dependencies interact globally with all others, please set **name="main"**.
When the value of an input is changed programmatically, dependency propagation
may be started by triggering the `"_enhancer.dependency."+name` event.

**IMPORTANT!**, since mvcct.enhancer doesnt depend on jQuery all above events are not defined with jQuery.

## Defining a custom Html5 fallback module
The fallback process can be customized at varoius levels. We already described how to add widgets with the `browserSupport.handlers.enhance` 
property. More advanced customizations may be obtained by providing other properties in `browserSupport.handlers`, namely:

`browserSupport.handlers.replace=function(type,support)`. It receives as input the original input type and the same object returned by
`getSupport().Html5InputSupport` and returns the input type to fallback to. If the function returns the same type received as input no further 
processing is done (fallback is aborted). The default function always returns "text", but in the case the input type is "range" and "number"
is supported where it returns "number", so that the "range" is substituted with a "number".

`browserSupport.handlers.translateVal=function(value, type, node)`. It is invoked after a fallback in order to translate 
the original content of the input into a value appropriate to the way the fallback works. It receives as input, the value to 
transform (a string), the original input type, and the new input type, and returns the new value(a string).
The default implementation furnished by the mvcct.enhancer.input.basic module uses the Globalize library to transform all 
date/time/numbers related input type values from the international ISO format into the current locale format, 
while leaving unchanged all other input types. This transformation is performed only if the new input type is "text".

`browserSupport.handlers.fullReplace=function(input)`. It allows a complete customization. It takes the input node
as input and transform the html around it in a custom way. No other automatic action is performed when this function
is provided.

 





  