# aspnet-helper
Little helper to develop faster ASP.NET MVC apps.

---

This extension parses your project to enable IntelliSense for Razor pages within an ASP.NET MVC project.

![](https://raw.githubusercontent.com/schneiderpat/aspnet-helper/dev/images/IntelliSenseDemo.gif)

---

## Usage

**Conventions over configuration.**

* Areas must be in *Areas* folder and *AreaRouteAttribute* must be the same name as the foldername
* Controllers must be in *Controllers* folder and named *<Name>Controller.cs*
* Actions must contain a *HttpGet* attribute
