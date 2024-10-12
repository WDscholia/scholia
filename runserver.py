from scholia.app import create_app
import sys

app = create_app(
    text_to_topic_q_text_enabled=False,
    third_parties_enabled=True)
app.config['APPLICATION_ROOT'] = '/'

if __name__ == '__main__':
    if len(sys.argv) == 2:
        app.run(debug=True, port=sys.argv[1])
    else:
        app.run(debug=True, port=8100)
