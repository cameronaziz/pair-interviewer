#!/usr/bin/env bash
set -eu

cd "$(dirname "$0")"

type -a conda || {
    echo "ERROR: Missing conda"
    echo "Try: brew install miniforge"
    false
} >&2

test -s ./daily_14.json || {
    echo "ERROR: Missing daily_14.json"
    echo "Please gunzip it after downloading it from: http://bulk.openweathermap.org/sample/"
    echo "See also: https://openweathermap.org/bulk"
    false
} >&2

set -x

conda env update -f environment.yml

until \
    FLASK_ENV=development \
    FLASK_DEBUG=1 \
    conda run -n weatherviz_env --no-capture-output python weatherviz_server.py "$@"
do sleep 0.$RANDOM
done
