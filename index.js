const fetch = require("node-fetch")
const express = require('express')
const PORT = process.env.PORT || 5000


/*const get_data = async (url, opts) => {
  try {
    const response = await fetch(url, opts);
    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.log(error);
  }
};*/


async function getInfo(req, res) {
    // const uri = 'https://api.thegraph.com/subgraphs/name/nategeier/mintbase'
    var url = 'https://api.thegraph.com/subgraphs/name/nategeier/mint-factory'

    const query = `
        query {
  store(id:"0xbbb73e8d4b263dd5eaeecc4ba457436669102973") {
    things {
      metaId
    }
  }
}
    `;

    const opts = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
    };

    let response
    let json

    try {
      response = await fetch(url, opts);
      json = await response.json();
      //console.log(json);
    } catch (error) {
      console.log(error);
    }


    let metaId
    let name
    let coordinates
    const opts2 = {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    };
    console.log(json)
    //console.log(json["data"])
    let response2
    let json2
    for (let i=0; i<json.data.store.things.length; i++) {
        metaId = json.data.store.things[i]["metaId"]
        //console.log(i)
        //console.log(metaId)
        url = 'https://us-central1-thing-1d2be.cloudfunctions.net/getThing?thingId=' + metaId
        // const response2 = getData(url, opts2);
        try {
          response2 = await fetch(url, opts2);
          json2 = await response2.json();
          console.log(json2);
        } catch (error) {
          console.log(error);
        }
        name = json2.name
        for (let ii=0; ii<json2.attributes.length; ii++) {
            if (json2.attributes[ii].trait_type == "coordinates"){
                coordinates = (json2.attributes[ii].value)
                break
            }
        }
        if (name == req.params["siteName"]) {
            break
        }
    }

    if (coordinates == undefined) {
        res.writeHead(404);
        res.end();
    } else {
        res.writeHead(301, { "Location": "https://play.decentraland.org/?position=" + coordinates });
        res.end();
    }
}

express()
  .get('/', (req, res) => res.send("Root"))
  .get('/map', (req, res) => res.send("Map"))
  /*.get('/:siteName', (req, res) => {
      res.writeHead(301, { "Location": "https://play.decentraland.org/" + req.params["siteName"] });
      res.end();

  })*/
  .get('/:siteName', getInfo)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
