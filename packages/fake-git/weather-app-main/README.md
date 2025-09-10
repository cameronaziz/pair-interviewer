# WeatherViz mini coding session

a starter code for interactive dataviz app prototyping with some realistic data from [Open Weather Map data](https://openweathermap.org/bulk).

## Getting Started

0. Prerequisite
```bash
brew install miniforge  # conda
brew install node
```

1. Launch the web server that serves some weather data via GraphQL.
```bash
webserver/start.sh
```

2. Launch the web app that grabs data from the server to visualize interactively.
```bash
cd webapp
npm install
npm start
```

3. That will open <http://localhost:3000/> in your browser.

4. Edit code in `webapp/src/` and `webserver/weatherviz_server.py` and reload until your changes work!

5. Hint: GraphiQL on <http://localhost:5000/graphql/> can be very useful for browsing the data and formulating your GraphQL queries.



## The Coding Exercise

Suppose we are building an interactive tool for browsing and understanding the historic weather data around the world.
There's some handy sample data downloadable from https://openweathermap.org/bulk (see "bulk examples").

In this coding exercise, let's build a feature or two that can help our users.
Suppose our users are trying to answer the following questions using our tool:
1. How did the temperature/rainfall change over time for a group of cities?
2. How do various weather measurement stats such as avg/high/low temperature compare across different countries.

For example, you can take what's in daily_14.json.gz and visualize as a line chart the temperature and other measurements for a couple days for cities that we make selectable.  It would be useful for comparison if more than one city or country's line can be shown on the same chart.  Being able to search any city in the dataset by name/country/location could be all very nice features to have.
