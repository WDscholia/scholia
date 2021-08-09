from scholia.app import create_app
from flask import redirect, request

app = create_app(
    text_to_topic_q_text_enabled=False,
    third_parties_enabled=True)
app.config['APPLICATION_ROOT'] = '/'
app.config['SUPPORTED_LANGUAGES'] = {'en': 'English'}
app.secret_key='p9uyg7yuwriwjigjergkrgrrrr'

# @app.route('/')
# def redir():
#     lang = request.cookies.get('lang_code',None)
#     if lang:
#         return redirect('/'+ lang + '/')
#     else:
#         return redirect('/en/')

if __name__ == '__main__':
    app.run(debug=True, port=8100)
