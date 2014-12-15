define({ "api": [
  {
    "version": "0.1.0",
    "group": "solr",
    "name": "get",
    "type": "get",
    "url": "/solr/get",
    "title": "",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "core",
            "description": "<p>Specify the core of solr</p> "
          }
        ]
      }
    },
    "filename": "api/controllers/v1/SolrController.js",
    "groupTitle": "solr"
  }
] });