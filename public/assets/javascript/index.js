$(document).ready(function() {
  // Setting a reference to the article-container div where all the dynamic content will go
  // Adding event listeners to any dynamically generated "save article" and "scrape new article" buttons
  var articleContainer = $(".article-container");
  $(document).on("click", ".btn.save", handleArticleSave);
  $(document).on("click", ".scrape-new", handleArticleScrape);

  // once the page is ready, run the initPage function
  initPage();

  function initPage() {
    // empty the article container, run an AJAX request for any unsaved headlines
    articleContainer.empty();
    $.get("/api/headlines?saved=false")
    .then(function(data) {
      // if we have headlines, render them to the page
      if (data && data.length) {
        renderArticles(data);
      }
      else {
        // otherwise render a message explaining we have no articles
        renderEmpty();
      }
    });
  }

  function renderArticles(articles) {
    // handles appending HTML containing the article data to the page
    // an array of JSON containing all available articles is passed to the database
    var articlePanels = [];
    // pass each aritcle JSON object to the createPanel function which returns a bootstrap panel with the article data inside
    for (var i = 0; i < articles.length; i++) {
      articlePanels.push(createPanel(articles[i]));
    }
    // once all of the HTML for the articles is stored in the articlePanels array, append them to the articlePanels container
    articleContainer.append(articlePanels);
  }

  function createPanel(article) {
    // takes in a single JSON object for an article/headlines
    // contructs a jQuery element containing all of the formatted HTML for the article panel
    var panel =
      $(["<div class='panel panel-default'>",
         "<div class='panel-heading'",
         "<h3>",
         article.headline,
         "<a class='btn btn-success save'>",
         "Save Article",
         "</a>",
         "</h3>",
         "</div>",
         "<div class='panel-body'>",
         article.summary,
         "</div>",
         "</div>"
       ].join(""));
       // attach the article's id to the jQuery element
       // this will be used to figure out which article the user wants to save
      panel.data("_id", article._id);
      return panel;
  }

  function renderEmpty() {
    // renders some HTML to the page explaining there aren't any articles to view
    var emptyAlert =
      $(["<div class='alert alert-warning text-center'>",
         "<h4>There aren't any new articles.</h4>",
         "</div>",
         "<div class='panel panel-default'>",
         "<div class='panel-heading text-center'>",
         "<h3>What would you like to do?</h3>",
         "</div>",
         "<div class='panel-body text-center'>",
         "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
         "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
         "</div>",
         "</div>"
      ].join(""));
      // appending this data to the page
      articleContainer.append(emptyAlert);
  }

  function handleArticleSave() {
    // triggered when the user wants to save an articleContainer
    // retrieving the javascript object containig the headline id
    var articleToSave = $(this).parents(".panel").data();
    articleToSave.saved = true;
    // using a patch method to be semantic since this is an update to an existing record in the collection
    $.ajax({
      method: "PATCH",
      url: "/api/headlines",
      data: articleToSave
    })
    .then(function(data) {
      // if successful, mongoose will send back an object containing a key of "ok" with the value of 1 which casts to be 'true'
      if (data.ok) {
        // run the initPage function again.  This will reload the entire list of articles
        initPage();
      }
    });
  }

  function handleArticleScrape() {
    // handles the user clicking any 'scrape new article' buttons
    $.get("/api/fetch")
      .then(function(data) {
        // if NY Times is successfully scraped, rerender the articles and let the user know how many were saved
        initPage();
        bootbox.alert("<h3 class='text-center m-top-80'>" + data.message + "</h3>");
      });
  }

});
