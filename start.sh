#!/bin/sh

#create the log dir if it isn't there already
LOG_DIR=/var/log/mikey/workers
mkdir -p $LOG_DIR

# Invoke the Forever module (to START our Node.js server).
forever start -c "node --max-old-space-size=600" -a -o $LOG_DIR/out.log -e $LOG_DIR/err.log workers.js