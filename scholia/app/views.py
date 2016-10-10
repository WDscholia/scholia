"""Views for app."""


from flask import redirect, render_template

from . import app
from ..query import orcid_to_qs


@app.route("/")
def index():
    return render_template('index.html')


@app.route('/orcid/<orcid_>')
def redirect_orcid(orcid_):
    qs = orcid_to_qs(orcid_)
    if len(qs) > 0:
        q = qs[0]
    return redirect("../author/{q}".format(q=q), code=302)


@app.route('/author/<q_>')
def show_author(q_):
    q = "Q20980928"
    try:
        if q_[0] == 'Q' and q_[1:].isdigit():
            q = 'Q' + str(int(q_[1:]))
    
    except:
        pass
    html = """
<html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="Content-language" content="en">

    <title>Scholia</title>

    <link rel="stylesheet" title="std" 
      href="http://people.compute.dtu.dk/faan/Nielsen2004.css" type="text/css">
    
  </head>

  <body>
    <h1>Scholia</h1>

    Scholarly profile page constructed from queries to Wikidata Query Service.
    Read more on <a href="https://twitter.com/search?q=wikicite">Twitter</a>.
    
    <h2>Education</h2>

    <iframe style="width:98vw; height:50vh;" frameborder="0" src="https://query.wikidata.org/embed.html#%23defaultView%3ATimeline%0ASELECT%20%3Feducation%20%3Feducation_label%20%3Feducation_beginning%20%3Feducation_ending%20%3Feducation_degree_label%20WHERE%20%7B%0A%20%20wd%3A{q}%20p%3AP69%20%3Feducation_statement%20.%0A%20%20%3Feducation_statement%20ps%3AP69%20%3Feducation%20.%0A%20%20%3Feducation%20rdfs%3Alabel%20%3Feducation_label%20.%20filter%20%28lang%28%3Feducation_label%29%20%3D%20%27en%27%29%0A%20%20optional%20%7B%20%3Feducation_statement%20pq%3AP580%20%3Feducation_beginning%20.%20%7D%0A%20%20optional%20%7B%20%3Feducation_statement%20pq%3AP582%20%3Feducation_ending%20.%20%7D%0A%20%20optional%20%7B%20%3Feducation_statement%20pq%3AP512%20%3Feducation_degree%20.%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Feducation_degree%20rdfs%3Alabel%20%3Feducation_degree_label%20.%20filter%20%28lang%28%3Feducation_degree_label%29%20%3D%20%27en%27%29%0A%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%20%7D%20%20%0A%7D%20"></iframe>
    
    
    <h2>List of publications</h2>

    <iframe style="width:98vw; height:50vh;" scrolling="yes" frameborder="0" src="https://query.wikidata.org/embed.html#%23defaultView%3ATable%0ASELECT%20%3Fwork%20%3FworkLabel%20%28min%28%3Fdates%29%20as%20%3Fdate%29%20%28sample%28%3Fpages_%29%20as%20%3Fpages%29%20%28sample%28%3Fvenue_labels%29%20as%20%3Fvenue%29%20%28group_concat%28%3Fauthor_label%3B%20separator%3D%22%2C%20%22%29%20as%20%3Fauthors%29%20WHERE%20%7B%0A%20%20%3Fwork%20wdt%3AP50%20wd%3A{q}%20.%0A%20%20%3Fwork%20wdt%3AP50%20%3Fauthor%20.%0A%20%20%3Fauthor%20rdfs%3Alabel%20%3Fauthor_label%20.%20filter%20%28lang%28%3Fauthor_label%29%20%3D%20%27en%27%29%0A%20%20%0A%20%20optional%20%7B%20%3Fwork%20wdt%3AP577%20%3Fdates%20%7D%0A%20%20optional%20%7B%20%3Fwork%20wdt%3AP1104%20%3Fpages_%20%7D%0A%20%20optional%20%7B%20%3Fwork%20wdt%3AP1433%20%3Fvenues%20.%20%3Fvenues%20rdfs%3Alabel%20%3Fvenue_labels%20.%20filter%20%28lang%28%3Fvenue_labels%29%20%3D%20%27en%27%29%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%20%7D%20%20%0A%7D%20group%20by%20%3Fwork%20%3FworkLabel%0Aorder%20by%20desc%28%3Fdate%29%20%20%20%20"></iframe>

    <h2>Venue statistics</h2>

<iframe style="width:48vw; height:50vh;" scrolling="yes" frameborder="0" src="https://query.wikidata.org/embed.html#%23defaultView%3ATable%0ASELECT%20%3Fvenue%20%3FvenueLabel%20%28count%28%3Fwork%29%20as%20%3Fcount%29%20WHERE%20%7B%0A%20%20%3Fwork%20wdt%3AP50%20wd%3A{q}%20.%0A%20%20%3Fwork%20wdt%3AP1433%20%3Fvenue%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%20%7D%20%20%0A%7D%20group%20by%20%3Fvenue%20%3FvenueLabel%0Aorder%20by%20desc%28%3Fcount%29"></iframe>

<iframe style="width:48vw; height:50vh;" frameborder="0" src="https://query.wikidata.org/embed.html#%23defaultView%3ABubbleChart%0ASELECT%20%3Fvenue%20%3FvenueLabel%20%28count%28%3Fwork%29%20as%20%3Fcount%29%20WHERE%20%7B%0A%20%20%3Fwork%20wdt%3AP50%20wd%3A{q}%20.%0A%20%20%3Fwork%20wdt%3AP1433%20%3Fvenue%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%20%7D%20%20%0A%7D%20group%20by%20%3Fvenue%20%3FvenueLabel%0Aorder%20by%20desc%28%3Fcount%29"></iframe>

    <h2>Co-author graph</h2>

    (this is unfortunately somewhat wobbly. Help, Jonas Kress!)


    <iframe style="width:98vw; height:50vh;" scrolling="yes" frameborder="0" src="https://query.wikidata.org/embed.html#%23defaultView%3AGraph%0ASELECT%20%3Fauthor1%20%3Fauthor1Label%20%3Frgb%20%3Fauthor2%20%3Fauthor2Label%20WHERE%20%7B%0A%20%20%3Fwork%20wdt%3AP50%20wd%3A{q}%20.%0A%20%20%3Fwork%20wdt%3AP50%20%3Fauthor1%20.%0A%20%20%3Fwork%20wdt%3AP50%20%3Fauthor2%20.%0A%20%20%3Fwork%20wdt%3AP31%20wd%3AQ13442814%20.%0A%20%20filter%20%28%3Fauthor1%20%21%3D%20%3Fauthor2%29%0A%20%20filter%20%28wd%3A{q}%20%21%3D%20%3Fauthor1%29%0A%20%20filter%20%28wd%3A{q}%20%21%3D%20%3Fauthor2%29%0A%20%20%3Fauthor1%20wdt%3AP21%20%3Fgender1%20.%20%0A%20%20bind%28%20if%28%3Fgender1%20%3D%20wd%3AQ6581097%2C%20%223333AA%22%2C%20%22AA3333%22%29%20as%20%3Frgb%29%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%0A%20%20%20%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%0A%20%20%7D%0A%7D%0A"></iframe>
    
    <h2>Themes</h2>

    <iframe style="width:48vw; height:50vh;" scrolling="yes" frameborder="0" src="https://query.wikidata.org/embed.html#%23defaultView%3AImageGrid%0Aselect%20%3Ftheme%20%3FthemeLabel%20%3Fimage%20%28count%28%3Fwork%29%20as%20%3Fcount%29%20%20%20WHERE%20%7B%0A%20%20%3Fwork%20wdt%3AP50%20wd%3A{q}%20.%0A%20%20%3Fwork%20wdt%3AP921%20%3Ftheme%20.%0A%20%20optional%20%7B%20%3Ftheme%20wdt%3AP18%20%3Fimage%20.%20%7D%0A%20%20service%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22%20.%20%7D%20%0A%7D%0Agroup%20by%20%3Ftheme%20%3FthemeLabel%20%3Fimage%0Aorder%20by%20desc%28%3Fcount%29%20%0A"></iframe>
    
    <iframe style="width:48vw; height:50vh;" scrolling="yes" frameborder="0" src="https://query.wikidata.org/embed.html#%23defaultView%3AImageGrid%0ASELECT%20distinct%20%3Fimage%20WHERE%20%7B%0A%20%20%7B%20wd%3A{q}%20wdt%3AP18%20%3Fimage%20.%20%7D%0A%20%20UNION%20%7B%0A%20%20%20%20wd%3A{q}%20%3Fproperty%20%3Fitem%20.%20%0A%20%20%20%20%3Fitem%20wdt%3AP18%20%3Fimage%0A%20%20%20%20filter%20%28%3Fitem%20%21%3D%20wd%3AQ5%29%0A%20%20%7D%0A%7D%20"></iframe>
    <br/><br/>
    (Something may be wrong in the plot below, - at least in my Firefox browser)
    <iframe style="width:98vw; height:50vh;" scrolling="yes" frameborder="0" src="https://query.wikidata.org/embed.html#%23defaultView%3ADimensions%0Aselect%20%3Fcount%20%3Ftheme_label%20%3Fwork_label%20%20%20WHERE%20%7B%0A%20%20%7B%20%0A%20%20%20%20select%20%3Ftheme%20%28count%28%3Fwork%29%20as%20%3Fcount%29%20where%20%7B%0A%20%20%09%20%20%3Fwork%20wdt%3AP50%20wd%3A{q}%20.%0A%20%20%20%20%20%20%3Fwork%20wdt%3AP921%20%3Ftheme%20.%0A%20%20%20%20%7D%0A%20%20%20%20group%20by%20%3Ftheme%0A%20%20%20%20order%20by%20desc%28%3Fcount%29%0A%20%20%7D%0A%20%20%3Fwork%20wdt%3AP50%20wd%3A{q}%20.%0A%20%20%3Fwork%20wdt%3AP921%20%3Ftheme%20.%0A%20%20%3Ftheme%20rdfs%3Alabel%20%3Ftheme_label%20.%20filter%20%28lang%28%3Ftheme_label%29%20%3D%20%27en%27%29%0A%20%20%3Fwork%20rdfs%3Alabel%20%3Fwork_label%20.%20filter%20%28lang%28%3Fwork_label%29%20%3D%20%27en%27%29%0A%7D%20"></iframe>


    
    <h2>Locations</h2>

    <iframe style="width:98vw; height:50vh;" scrolling="yes" frameborder="0" src="https://query.wikidata.org/embed.html#%23defaultView%3AMap%0ASELECT%20distinct%20%3Fimage%20%3Fitem%20%3Fitem_label%20%3Fgeo%20%28%3Fproperty%20as%20%3Flayer%29%20WHERE%20%7B%0A%20%20wd%3A{q}%20%3Fproperty%20%3Fitem%20.%20%0A%20%20%3Fitem%20wdt%3AP625%20%3Fgeo%20.%0A%20%20%3Fitem%20rdfs%3Alabel%20%3Fitem_label%20.%20filter%20%28lang%28%3Fitem_label%29%20%3D%20%27en%27%29%0A%20%20optional%20%7B%20%3Fitem%20wdt%3AP18%20%3Fimage%20.%20%7D%20%0A%7D"></iframe>
    

    <h2>Citation statistics</h2>

    <h3>Most cited work</h3>

    <iframe style="width:98vw; height:50vw;" scrolling="yes" frameborder="0" src="https://query.wikidata.org/embed.html#%23defaultView%3ATable%0ASELECT%20%3Fwork%20%3Fwork_label%20%28count%28%3Fciting_work%29%20as%20%3Fcount%29%20WHERE%20%7B%0A%20%20%3Fwork%20wdt%3AP50%20wd%3A{q}%20.%0A%20%20%3Fciting_work%20wdt%3AP2860%20%3Fwork%20.%20%0A%20%20%3Fwork%20rdfs%3Alabel%20%3Fwork_label%20.%20filter%20%28lang%28%3Fwork_label%29%20%3D%20%27en%27%29%0A%7D%20group%20by%20%3Fwork%20%3Fwork_label%0Aorder%20by%20desc%28%3Fcount%29%0Alimit%2020"></iframe>

    <h3>Citing authors</h3>

    (excluding citations from my own papers)

    <iframe style="width:80vw; height:50vh;" scrolling="yes" frameborder="0" src="https://query.wikidata.org/embed.html#%23defaultView%3ATable%0ASELECT%20%3Fciting_author%20%3Fciting_author_label%20%28count%28%3Fciting_work%29%20as%20%3Fcount%29%20WHERE%20%7B%0A%20%20%3Fwork%20wdt%3AP50%20wd%3A{q}%20.%0A%20%20%3Fciting_work%20wdt%3AP2860%20%3Fwork%20.%20%0A%20%20minus%20%7B%20%3Fciting_work%20wdt%3AP50%20wd%3A{q}%20%7D%0A%20%20%3Fciting_work%20wdt%3AP50%20%3Fciting_author%20.%0A%20%20%3Fciting_author%20rdfs%3Alabel%20%3Fciting_author_label%20.%20filter%20%28lang%28%3Fciting_author_label%29%20%3D%20%27en%27%29%0A%7D%20group%20by%20%3Fciting_author%20%3Fciting_author_label%0Aorder%20by%20desc%28%3Fcount%29%0Alimit%2020">


  </body>

</html>""".format(q=q)
    return html
