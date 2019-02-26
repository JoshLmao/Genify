<h1 align="center">
  <br>
  Genify
  </br>
</h1>

<p align="center">
  <a href="https://twitter.com/JoshLmao">
    <img src="https://img.shields.io/badge/twitter-JoshLmao-blue.svg?style=flat-square.svg"/>
  </a>
  <a href="https://genify.joshlmao.com">
    <img src="https://img.shields.io/badge/website-online-green.svg?style=flat-square.svg"/>
  </a>
</p>

# What is Genify?

Ever wanted to sing along to the current song but couldn't find the lyrics quick enough? 
This tool can fix that! I've integrated Spotify connectivity to Genius to show the lyrics
so you can spend more time singing and less time searching online 😉
<br/>
TL;DR: I got tired of Spotify not having this integrated, so I did it myself

## CORS Issue

To make REST Api calls, we need to use a proxy that adds the CORS headers to the request, since we're doing it from a static page on Github Pages. To do that, I'm using [Rob-W's Cors-Anywhere](https://github.com/Rob--W/cors-anywhere/) proxy server hosted on [Heroku](https://heroku.com/).

**Proxy Site:** [Genify-Proxy.heroku.com](https://genify-proxy.herokuapp.com)

## Donations

If you want to support my open source work, please consider buying me a coffee (or two! ;D)

<p align="center">
  <a href="https://ko-fi.com/joshlmao"><img src="https://i.imgur.com/zDeHMoK.png" height="65px"/>
  <a href="https://paypal.me/ijoshlmao"><img src="https://i.imgur.com/UfSd0gP.png" height="75px"/>
</p>
