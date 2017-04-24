from scholia.app import create_app


app = create_app()
app.config['APPLICATION_ROOT'] = '/'

if __name__ == '__main__':
    app.run(debug=True)
