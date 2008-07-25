#!/bin/sh
#cd chrome
#zip -r mensafuchs.jar content/ skin/
#cd ..
zip -r mensafuchs.xpi install.rdf chrome.manifest mensafuchs/ -x '*/RCS/*' -x '*/.*'
