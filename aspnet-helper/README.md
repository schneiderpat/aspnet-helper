# aspnet-helper
Little helper to develop faster ASP.NET MVC apps.

---

This extension parses your project to enable IntelliSense for Razor pages within an ASP.NET MVC project.

## What`s new in 0.6.0

The extension now checks if your used model is still valid. 
If your model has changed and you open a view using it, 
you will see which properties aren`t available anymore or misspelled.

### Models

The *@Model* declaration now shows which properties your class exposes.
Just type **@Model.** and you will get suggestions.

> NOTE! There is no refactoring or other advanced things! I'm working on that feature in future releases!

At the moment there should be just one class per file.

![](https://raw.githubusercontent.com/schneiderpat/aspnet-helper/master/aspnet-helper/images/ModelDemo.gif)

### Links

IntelliSense while creating anchor tags in your razor page. 

![](https://raw.githubusercontent.com/schneiderpat/aspnet-helper/master/aspnet-helper/images/IntelliSenseDemo.gif)

You got multiple ways to create your tags.


```html

<a asp-area="Awesome" asp-controller="Foo" asp-action="Fancy">Link 1</a>

<a asp-controller="Foo" asp-action="Fancy">Link 2</a>

<a asp-action="Fancy">Link 3</a>

```

---

## Usage

**Conventions over configuration.**

* Areas must be in *Areas* folder and *AreaRouteAttribute* must be the same name as the foldername
* Controllers must be in *Controllers* folder and named *<Name>Controller.cs*
* Actions must contain a *HttpGet* attribute
* Namespaces for used models must be in a *_ViewImports.cshtml* -> only model names in razor page


## Found a Bug?
Please file any issues at https://github.com/schneiderpat/aspnet-helper/issues.