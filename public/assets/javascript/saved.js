$(document).ready(function() {
  // getting a reference to the article contatiner div that will be rendering all articles
  var articleContainer = $(".article.container");
  // adding event listeners for dynamically generated buttons for deleting articles, pulling up article notes, saving article notes, and deleting notes
  $(document).on("click", ".btn.delete", handleArticleDelete);
  $(document).on("click", ".btn.notes", handleArticleNotes);
  $(document).on("click", ".btn.save", handleNoteSave);
  $(document).on("click", ".btn.note-delete", handleNoteDelete);

  initPage();

  function initPage() {
    // empty the article container, run an AJAX request for any saved headlines
    articleContainer.empty();
    $.get("/api/headlines?saved=true")
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
         "<a class='btn btn-danger delete'>",
         "Delete From Saved",
         "</a>",
         "<a class='btn btn-info notes'>Article Notes</a>",
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
         "<h4>There aren't any saved articles.</h4>",
         "</div>",
         "<div class='panel panel-default'>",
         "<div class='panel-heading text-center'>",
         "<h3>Would you like to browse available articles?</h3>",
         "</div>",
         "<div class='panel-body text-center'>",
         "<h4><a href='/'>Browse Articles</a></h4>",
         "</div>",
         "</div>"
      ].join(""));
      // appending this data to the page
      articleContainer.append(emptyAlert);
  }

  function renderNotesList(data) {
    // handles rendering note list items to the notes modal
    // setting up an array of notes to render after finished
    // setting up a currentNote variable to temporarily store each note
    var notesToRender = [];
    var currentNote;
    if (!data.notes.length) {
      // if there are no notes, display a message
      currentNote = [
        "<li class ='list-group-item'>",
        "No notes for this article yet",
        "</li>"
      ].join("");
      notesToRender.push(currentNote);
    }
    else {
      for (var i = 0; i < data.notes.length; i++) {
        currentNote = $([
          "<li class='list-group-item note'>",
          data.notes[i].noteText,
          "<button class='btn btn-danger note-delete'>x</button>",
          "</li>"
        ].join(""));
        // store the note id on the delete button for easy access when trying to delete
        currentNote.children("button").data("_id", data.notes[i]._id);
        // adding currentNote to the notesToRender array
        notesToRender.push(currentNote);
      }
    }
    // append the notesToRender to the note-container inside the note modal
    $(".note-container").append(notesToRender);
  }

  function handleArticleDelete() {
    // grab the id of the article to delete from the panel element
    var articleToDelete = $(this).parents(".panel").data();
    // using a delete method
    $.ajax({
      method: "DELETE",
      url: "api/headlines/" + articleToDelete._id
    }).then(function(data) {
      if (data.ok) {
        initPage();
      }
    });
  }

  function handleArticleNotes() {
    // handles opening the notes modal and displaying the notes
    var currentArticle = $(this).parents(".panel").data();
    // grab any notes with this headline/article id
    $.get("/api/notes" + currentArticle._id).then(function(data) {
      // constructing the initial HTML to add to the notes modal
      var modalText = [
        "<div class='container-fluid text-center'>",
        "<h4>Notes For Article: ",
        currentArticle._id,
        "</h4>",
        "<hr />",
        "<ul class='list-group note-container'>",
        "</ul>",
        "<textarea placeholder='New Note' row='4' cols='60'></textarea>",
        "<button class='btn btn-success save'>Save Note</button>",
        "</div>"
      ].join("");
      bootbox.dialog({
        message: modalText,
        closeButton: true
      });
      var noteData = {
        _id: currentArticle._id,
        notes: data || []
      };
      $(".btn.save").data("article", noteData);
      renderNotesList(noteData);
    });
  }

  function handleNoteSave() {
    // grabs the note typed into the input bootbox
    var noteData;
    var newNote = $(".bootbox.body textarea").val().trim();
    // send data typed and post it to the /api/notes route
    if (newNote) {
      noteData = {
        _id: $(this).data("article")._id,
        noteText: newNote
      };
      $.post("/api/notes", noteData).then(function() {
        // close modal when complete
        bootbox.hideAll();
      });
    }
  }

  function handleNoteDelete() {
    var noteToDelete = $(this).data("_id");
    // perform Delete request to 'api/notes/' with the id of the note as the parameter
    $.ajax({
      url: "api/notes/" + noteToDelete,
      method: "DELETE"
    }).then(function() {
      // hide modal when done
      bootbox.hideAll();
    });
  }

});
