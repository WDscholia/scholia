from scholia.app import create_app


app = create_app(
    text_to_topic_q_text_enabled=True,
    third_parties_enabled=False)
app.config['APPLICATION_ROOT'] = '/'

if __name__ == '__main__':
    app.run(debug=True)
