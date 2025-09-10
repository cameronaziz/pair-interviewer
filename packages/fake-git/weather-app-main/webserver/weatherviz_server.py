# a server for the weatherviz app

# See: https://docs.graphene-python.org/en/latest/quickstart/
import graphene
from schema import Query
import flask
from flask_graphql import GraphQLView
from data import DataLoader

class ContextedView(GraphQLView):
  context_value = {"data_loader": DataLoader()}

  def get_context(self):
    context = super().get_context()
    if self.context_value:
      for k, v in self.context_value.items():
        setattr(context, k, v)
    return context

schema = graphene.Schema(query=Query)

# See: https://github.com/graphql-python/flask-graphql
app = flask.Flask(__name__)

app.add_url_rule('/graphql', view_func=ContextedView.as_view(
    'graphql',
    schema=schema,
    graphiql=True,
    # context=context,
))

# Optional, for adding batch query support (used in Apollo-Client)
app.add_url_rule('/graphql/batch', view_func=ContextedView.as_view(
    'graphql-batch',
    schema=schema,
    batch=True,
    # context=context,
))

@app.route('/')
def landing():
    return flask.redirect(flask.url_for('graphql', query='''\
query {
  city(limit:3, offset: 1234) {
    id
    name
    country
    coordinates {
      lon
      lat
    }
    weatherData {
      tempDay
      rain
    }
  }
}
'''))

if __name__ == '__main__':
    app.run()
