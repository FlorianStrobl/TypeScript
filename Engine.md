### Why, what, huh?

You are in space. Endeless blackness everywhere you look. Suddenly a table apears in front of you. It has a candle on it. Light gets emited by the fire of the candle.

Why can you see the table? Because the light from the candle bounces off the surface of the table and some of it goes straight into your eye. Light of different wavelengths hits your retina but only the ones with 570nm, 540nm and 430nm wavelengths are recognised by the different cone cells and are processed by your brain as red, green and blue respectifly. Furthermore, the luminance of the light changes the way we percive brightness. That means the amount of particels which hit our eye.

[Image of a table with a lightend candle]

But why bother with this? Because I want to digitalize this in form of a rendering engine. A virtuall non-existing camera is positioned in nowere and you place objects were you want with many different kinds of properties. A glass filled with water, some rubic's cubes, a bright yellowish light from a lamp and a dimmer lamp with colder light... This image should get calculated by a software on your PC and then showen to you through your monitor.

I am by no means the first one to do this. In fact every video game you play or many movies with CGI scenes do exactly that.

I want to go on the journey of learning how this works, implementing it in the language C++ (in the version C++20 and the Microsoft Compiler MSVC) hopefully without any pre-existing library or code and then getting it to work on my Windows 11 computer to render some objects in scenes I created.

### The rendering engine

The following text will go through different levels of abstractions until the finished implementation of the renderer.
It will start with a pure theoretical part of the task, then goes into the mathematical sides behind rendering, adds pseudocode to show how to do it in a efficient way and concludes with some actuall C++ code.

The notation of the pseudocode
