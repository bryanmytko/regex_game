$(document).ready(function(){

  var current_round = 0;
  var current_matches = [];
  var regex_input = $('#regex-input');
  var list = $('ul#regex-list');
  var title = $('h2.title');

  var list_item = '<li class="list-group-item"></li>';

  var rounds = [
    { rules: "Match only the lines starting with letters!",
      words: ["Test word", "Foo", "Lorem Ipsum", "999 82838 eee 88"],
      win_condition: ["Test word", "Foo", "Lorem Ipsum"]
    },
    { rules: "Match telephone numbers that only contain numbers & dashes!",
      words: ["123 123 1234", "938-3323", "444-Websitez", "555-555-5555", "1-800-CSS-TRIX", "General Assembly"],
      win_condition: ["123 123 1234", "938-3323", "555-555-5555"]
    }
  ];

  regex_input.keyup(function(e){
    var pattern = $(this).val();
    highlight_pattern(pattern);
    check_win_condition();
  });

  function highlight_pattern(string_pattern){
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
          current_matches[i] = match;
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

    // if(win_condition.length == current_condition.length
    //     && win_condition.every(function(v,i){

    if(win_condition.every(function(v,i){ return current_condition.indexOf(v) !== -1; })){
      complete_round();
    }
  }

  function complete_round(){
    if(current_round < rounds.length - 1){
      current_round += 1;
      populate_state();
    } else {
      regex_input.remove();
      list.remove();
      title.html("You won.");
    }
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
