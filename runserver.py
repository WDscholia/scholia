from scholia.app import create_app


app = create_app(
    text_to_topic_q_text_enabled=False,
    third_parties_enabled=True)
app.config['APPLICATION_ROOT'] = '/'

if __name__ == '__main__':
    app.run(debug=True, port=8100, host='0.0.0.0')
