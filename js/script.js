$(document).ready(function(){

  var current_round = 0;
  var current_matches = [];
  var form = $('form');
  var regex_input = $('#regex-input');
  var list = $('ul#regex-list');
  var title = $('h2.title');
  var list_item = '<li class="list-group-item"></li>';
  var inbetween_text = $('.inbetween-text');
  var win_string = '<p class="win">Congrats! You are a RegEx Champion!</p>';
  var song = new Audio('audio/got.mp3');

  var rounds = [
    // { rules: "Testing", words: ["1", "2"], win_condition: ["1"] }
    { rules: "Match only the Stark children.",
      words: ["Bran Stark", "Rickon Stark", "Jon Snow", "Arya Stark", "Sansa Stark", "Robb Stark", "Theon Greyjoy"],
      win_condition: ["Bran Stark", "Rickon Stark", "Arya Stark", "Sansa Stark", "Robb Stark"]
    },
    { rules: "Daenerys is in trouble. Match the valid phone number so Tyrion can call and warn her!",
      words: ["333-5554-2993", "516-555-3722", "440-22d-9393", "7999-3333", "8-9-9"],
      win_condition: ["516-555-3722"]
    }
  ];

  var completed_text = [
    "Nice Job!",
    "Great! Keep it up!",
    "You know nothing Jon Snow...",
    "Correct! Nice!",
    "Very good! Let's try another"
  ];

  regex_input.keyup(function(e){
    var pattern = regex_input.val();
    highlight_pattern(pattern);
    check_win_condition();
  });

  form.on("click", ".inbetween-text", function(){
    populate_next_round();
  });

  function highlight_pattern(string_pattern){
    // User input might be incomplete resulting in invalid RegExp, which we
    // shouldn't care about.
    try {
      var pattern = new RegExp(string_pattern, "i");
    } catch(e) {
      var pattern = new RegExp();
    }

    list.children("li").each(function(i){
      var _this = $(this);
      var _this_text = _this.text();
      var m = _this_text.match(pattern);

      if(m !== undefined && m !== null && m.length > 0){
        var match = m[0];
        var new_text = _this_text.replace(
          match, '<span class="matched">' + match + '</span>'
        );
        _this.html(new_text);

        if(_this_text === match){
          current_matches[i] = match;
        } else {
          current_matches[i] = "";
        }
      }
    });
  }

  function check_full_match(match, obj){
    if(match.length === obj.text().length){
      obj.fadeOut();
    }
  }

  function check_win_condition(){
    var win_condition = rounds[current_round].win_condition;
    var current_condition = current_matches.filter(Boolean);

    /* Oh, javascript */
    if(win_condition.length == current_condition.length
        && win_condition.every(function(v,i){ return current_condition.indexOf(v) !== -1; })){
      complete_round();
    }
  }

  function random_inbetween_text(){
    var link = " Click to continue! &#9658;";
    return completed_text[Math.floor(Math.random()*completed_text.length)] + link;
  }

  function complete_round(){
    if(current_round < rounds.length - 1){
      regex_input.hide();
      inbetween_text
        .show()
        .html(random_inbetween_text());
    } else {
      regex_input.remove();
      inbetween_text
        .show()
        .addClass("winner")
        .html("")
        .prepend(win_string);

      form.unbind();
      song.play();
    }
  }

  function populate_next_round(){
    current_matches = [];
    inbetween_text.hide()
    regex_input.show();
    current_round += 1;
    populate_state();
  }

  function populate_state(){
    title.html(rounds[current_round].rules);
    list.children().remove();
    regex_input.val("");

    rounds[current_round].words.forEach(function(el){
      var li = $(list_item).text(el);
      list.append(li);
    });
  }

  function initialize(){
    populate_state();
  }

  initialize();
});
