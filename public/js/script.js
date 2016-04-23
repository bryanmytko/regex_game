$(document).ready(function(){

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

  // var rounds = [{
  //   rules: "Debug",
  //   words: ["1", "2"],
  //   win_condition: ["1"],
  //   hint: "Debugging."
  // }];

  var RegexGame = function(options){
    var self = this;

    this.start_time,
    this.final_time,
    this.current_round = 0,
    this.current_matches = [],
    this.game_container = $('div#game-container'),
    this.game_input = $('#game-input'),
    this.title = $('h2.title'),
    this.form = $('form#game'),
    this.list = $('ul#game-list'),
    this.inbetween_text = $('.inbetween-text'),
    this.leaderboard = $('div#leaderboard'),
    this.hint = $('.hint'),
    this.win_string = '<p class="win">Congrats! You are a RegEx Champion!</p>',
    this.link = " Click to continue! &#9658;",
    this.song = new Audio('audio/got.mp3'),

    this.options = $.extend({
      rounds: [
        { rules: "Testing: Debugging",
          words: ["1","2"],
          win_condition: ["1"],
          hint: "Hello.",
        }
      ],
      completed: ["Great! Keep it up!"],
      name: "",
    }, options);

    this.game_input.keyup(function(){
      var pattern = $(this).val();
      self.highlight_pattern(pattern);
      self.check_win_condition();
    });

    this.form.submit(function(e){ e.preventDefault(); });

    this.form.on("click", ".inbetween-text", function(){
      self.populate_next_round();
    });

  };

  RegexGame.prototype = {
    start: function(){
      this.start_time = new Date().getTime();
      this.game_container.show();
      this.form.show();
      this.populate_state();
    },

    populate_state: function(){
      var current = this.options.rounds[this.current_round];
      var list = this.list;

      this.title.html(current.rules);
      this.list.children().remove();
      this.game_input.val("");

      current.words.forEach(function(el){
        var li = '<li class="list-group-item"></li>';
        list.append($(li).text(el));
      });

      this.hint.html(current.hint);
    },

    populate_leaderboard: function(){
      $.ajax({
        url: '/leaderboard',
        method: 'post',
        data: { "name": this.options.name, "time": this.stop_timer() },
        success: this.update_leaderboard
      });
    },

    /* @TODO This could stand some refactoring */
    highlight_pattern: function(string_pattern){
      var self = this;

      // User input might be incomplete resulting in invalid RegExp, which we
      // shouldn't care about.
      try {
        var pattern = new RegExp(string_pattern, "i");
      } catch(e) {
        var pattern = new RegExp();
      }

      this.list.children("li").each(function(i){
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
            self.current_matches[i] = match;
          } else {
            self.current_matches[i] = "";
          }
        } else {
          var text = _this.text();
          self.current_matches[i] = "";
          _this.find("span").remove();
          _this.text(text);
        }
      });
    },

    check_full_match: function(match, obj){
      if(match.length === obj.text().length){
        obj.fadeOut();
      }
    },

    check_win_condition: function(){
      var win_condition = this.options.rounds[this.current_round].win_condition;
      var current_condition = this.current_matches.filter(Boolean);

      /* Oh, javascript */
      if(win_condition.length == current_condition.length
          && win_condition.every(function(v,i){
            return current_condition.indexOf(v) !== -1;
          })){
            this.complete_round();
      }
    },

    continue_prompt: function(){
      var text = this.options.completed[
        Math.floor(Math.random() * this.options.completed.length)
      ];

      return text + this.link;
    },

    complete_round: function(){
      if(this.current_round < this.options.rounds.length - 1){
        this.game_input.hide();
        this.inbetween_text
          .show()
          .html(this.continue_prompt());
      } else {
        this.final_time = this.stop_timer();
        this.populate_leaderboard();

        this.game_input.remove();
        this.inbetween_text
          .show()
          .addClass("winner")
          .html("")
          .prepend(this.win_string);

        this.form.unbind();
        this.hint.hide();
        this.song.play();
      }
    },

    populate_next_round: function(){
      this.current_matches = [];
      this.inbetween_text.hide()
      this.game_input.show();
      this.current_round += 1;
      this.populate_state();
    },

    update_leaderboard: function(data){
      var scores = JSON.parse(data);
      var leaderboard = $(self.leaderboard);

      scores.forEach(function(score){
        leaderboard.children("ol").append(
          '<li>'
          + score.name
          + ' <span>('
          + String(score.time).to_leaderboard_time()
          + ')</span></li>'
        );
      });

      leaderboard.show();
    },

    stop_timer: function(){
      var time = new Date().getTime() - this.start_time;
      return time;
    }

  };

  var intro_form = $('form#intro');

  /* Start game when user submits their name */
  intro_form.on("submit", function(e){
    var _this = $(this);
    name = _this.children('input[name=name]').val();
    _this.hide();

    var completed = [
      "Nice Job!",
      "Great! Keep it up!",
      "You know nothing " + name + "...",
      "Correct! Nice!",
      "Very good! Let's try another"
    ];

    game = new RegexGame({ rounds: rounds, completed: completed, name: name });
    game.start();

    e.preventDefault();
  });

});
