<!-- Workaround for align right with hyperlink-->
<p align="right">
  <a href="https://genify.joshlmao.com">
    <img src="img/favicon.png" width="65px" align="right"></img>
  </a>
</p>

<p align="center">
  <h1>Genify</h1>
</p>

<p align="center">
  <a href="https://twitter.com/JoshLmao">
    <img src="https://img.shields.io/badge/twitter-JoshLmao-blue.svg?style=flat-square.svg"/>
  </a>
  <a href="https://genify.joshlmao.com">
    <img src="https://img.shields.io/badge/website-online-brightgreen.svg?style=flat-square.svg"/>
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

## Lyric Romanization

If the lyrics of the current song are in Korean, Chinese or Japanese, you can translate the lyrics to their roman equivalent. The following libraries are used to do that

Korean <-> Romaja: [Aromanjize-JS by Fujaru](https://github.com/fujaru/aromanize-js)

Chinese <-> Pinyin: [Pinyin4JS by SuperBiger](https://github.com/superbiger/pinyin4js)

Japanese <-> Romanji: Coming soon...

## Donations

If you want to support my open source work, please consider buying me a coffee (or two! ;D)
<p align="center">
  <a href="https://brave.com/jos677" align="center">
      <img src="img/BraveBat.png" height="65px"></img>
      <h4 align="center">Supporter of Brave & BAT - Tips welcome!</h4>
  </a>
</p>

<p align="center">
  <a href="https://ko-fi.com/joshlmao"><img src="https://i.imgur.com/zDeHMoK.png" height="65px"/>
  <a href="https://paypal.me/ijoshlmao"><img src="https://i.imgur.com/UfSd0gP.png" height="75px"/>
</p>
