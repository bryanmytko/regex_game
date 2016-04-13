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
  var hint = $('.hint');

  var rounds = [
    { rules: "Let's start easy. Match House Lannister",
      words: ["House Lannister", "House Baratheon", "Hodor"],
      win_condition: ["House Lannister"],
      hint: "This one is too easy for a hint.",
    },
    { rules: "A Lannister always pays their debts. Find the numeric strings!",
      words: ["4000", "#ccffcc", "49299", "c-3p0", "r2-d2", "1", "99999"],
      win_condition: ["4000", "49299", "1", "99999"],
      hint: "Try using the digit shortcut \d."
    },
    { rules: "Spoiler Alert! Match every character whose name starts with \"M\"",
      words: ["Melisandre", "Stannis", "Robb Stark", "Margaery Tyrell", "Joffrey Baratheon"],
      win_condition: ["Melisandre", "Margaery Tyrell"],
      hint: "Look up greedy matches."
    },
    { rules: "Match only the Stark children.",
      words: ["Bran Stark", "Rickon Stark", "Jon Snow", "Arya Stark", "Sansa Stark", "Robb Stark", "Theon Greyjoy"],
      win_condition: ["Bran Stark", "Rickon Stark", "Arya Stark", "Sansa Stark", "Robb Stark"],
      hint: "What's the pattern here? They all end with 'Stark'!"
    },
    { rules: "Match the brothers Clegane",
      words: ["Gregor 'The Mountain That Rides' Clegane", "Sandor 'The Hound' Clegane"],
      win_condition: ["Gregor 'The Mountain That Rides' Clegane", "Sandor 'The Hound' Clegane"],
      hint: "Using the pipe character allows you to specify OR like so: (a|b)"
    },
    { rules: "Daenerys is in trouble. Match the valid phone number so Tyrion can call and warn her!",
      words: ["333-5554-2993", "516-555-3722", "440-22d-9393", "7999-3333", "8-9-9"],
      win_condition: ["516-555-3722"],
      hint: "Remember the curly brackets {} allow you to specify a specific number of matched characters."
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

        console.log(current_matches);
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
      hint.hide();
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
    var current = rounds[current_round];
    title.html(current.rules);
    list.children().remove();
    regex_input.val("");

    rounds[current_round].words.forEach(function(el){
      var li = $(list_item).text(el);
      list.append(li);
    });

    hint.html(current.hint);
  }

  function initialize(){
    populate_state();
  }

  initialize();
});
