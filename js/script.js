$(document).ready(function(){

  var current_round = 0;
  var current_matches = [];
  var form = $('form#game');
  var intro_form = $('form#intro');
  var game_container = $('div.regex');
  var game_input = $('#regex-input');
  var list = $('ul#regex-list');
  var title = $('h2.title');
  var list_item = '<li class="list-group-item"></li>';
  var inbetween_text = $('.inbetween-text');
  var win_string = '<p class="win">Congrats! You are a RegEx Champion!</p>';
  var leaderboard = $('div#leaderboard');
  var song = new Audio('audio/got.mp3');
  var hint = $('.hint');
  var name, start_time, final_time;

  var rounds = [
    // { rules: "Testing: Debugging",
    //   words: ["1","2"],
    //   win_condition: ["1"],
    //   hint: "Hello.",
    // },
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
      words: ["Gregor 'The Mountain That Rides' Clegane", "Sandor 'The Hound' Clegane", "Grey Worm"],
      win_condition: ["Gregor 'The Mountain That Rides' Clegane", "Sandor 'The Hound' Clegane"],
      hint: "Using the pipe character allows you to specify OR like so: (a|b)"
    },
    { rules: "Daenerys is in trouble. Match the valid phone numbers so Tyrion can call and warn her!",
      words: ["333-5554-2993", "516-555-3722", "440-22d-9393", "917-555-9830", "7999-3333", "8-9-9"],
      win_condition: ["516-555-3722", "917-555-9830"],
      hint: "Remember the curly brackets {} allow you to specify a specific number of matched characters."
    },
    { rules: "Passwords to TheDreadFort.com must be secure! Match all passwords that include at least 1 non alphanumeric character.",
      words: ["password123", "pa55w0rD!a9", "r00sebolt0n9^", "r4msaySn0w"],
      win_condition: ["pa55w0rD!a9", "r00sebolt0n9^"],
      hint: "This one is tricky! Do your best."
    }
  ];

  var completed_text = [
    "Nice Job!",
    "Great! Keep it up!",
    "You know nothing Jon Snow...",
    "Correct! Nice!",
    "Very good! Let's try another"
  ];

  game_input.keyup(function(){
    var pattern = game_input.val();
    highlight_pattern(pattern);
    check_win_condition();
  });

  intro_form.submit(function(e){
    name = $(this).children('input[name=name]').val();
    $(this).hide();
    initialize();
    populate_state();
    e.preventDefault();
  });

  form.submit(function(e){ e.preventDefault(); });

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
      } else {
        var text = _this.text();
        current_matches[i] = "";
        _this.find("span").remove();
        _this.text(text);
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

  function continue_prompt(){
    var link = " Click to continue! &#9658;";
    return completed_text[Math.floor(Math.random()*completed_text.length)] + link;
  }

  function complete_round(){
    if(current_round < rounds.length - 1){
      game_input.hide();
      inbetween_text
        .show()
        .html(continue_prompt());
    } else {
      final_time = stop_timer();
      populate_leaderboard();

      game_input.remove();
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
    game_input.show();
    current_round += 1;
    populate_state();
  }

  function populate_state(){
    var current = rounds[current_round];
    title.html(current.rules);
    list.children().remove();
    game_input.val("");

    rounds[current_round].words.forEach(function(el){
      var li = $(list_item).text(el);
      list.append(li);
    });

    hint.html(current.hint);
  }

  var dummy_leaderboard = {
    "values":
      [
        { "name": "Bryan", "time": "1m22s" },
        { "name": "JBell", "time": "1m33s" },
        { "name": "Dennis L.", "time": "2m55s" },
        { "name": "Marina", "time": "3m12s" },
        { "name": "Shawn", "time": "5m01s" }
      ]
  };

  function populate_leaderboard(){
    return; // early return, feature incomplete

    //  Add time to db
    // Fetch top ~10 results
    var list = leaderboard.children('ol');
    leaderboard.show();
    dummy_leaderboard["values"].forEach(function(el){
      list.append('<li>' + el.name + ' <span>(' + el.time + ')</span></li>');
    });
  }

  function stop_timer(){
    /* @TODO Better time output, probably in minutes */
    var t = new Date().getTime() - start_time;
    var elapsed = Math.floor(t / 10) / 100;
    return elapsed.toFixed(2);
  }

  function initialize(){
    start_time = new Date().getTime();
    game_container.show();
    form.show();
  }
});
