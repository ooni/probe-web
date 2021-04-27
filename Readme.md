# OONI Probe Web

This is a web based measurement instrument for detecting some forms of web
based censorship.

It is not meant to be a full replacement of [OONI
Probe](https://github.com/ooni/probe) on desktop or mobile, but rather
complements these datasets with an approach that is simpler to run for end
users.

Prior work exists on how to measure censorship from the web browser. The first
appearance of this method is [credited to Dan
Kaminsky](https://twitter.com/dakami/status/191632765412839424) with
[CensorSweeper](https://www.slideshare.net/dakami/black-ops-2012).
This methodology was further expanded upon by
[Sam Burnett et. al](https://arxiv.org/pdf/1410.1211.pdf)
with a tool called [Encore](https://github.com/sburnett/encore).

At the base the idea is pretty simple, you load a bunch of invisible (or
visible in the case of CensorSweeper) `img`, `iframe` or `script` tags inside
of the measurement web page and register the `load` or `error` event listeners.
The `load` event will tell you if the resource in question is accessible, while
the `error` event will tell you if it's being interfered with.

