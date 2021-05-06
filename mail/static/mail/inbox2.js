function load_mailbox(mailbox) {
  
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#individual-email').style.display = 'none';
  
    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    
    console.log("load_email")
    fetch('/emails/'+mailbox)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);
  
        // Create a list of all emails in mailbox
        var mainContainer = document.getElementById("emails-view");
        for (var i = 0; i < emails.length; i++) {
          var div = document.createElement("div");
          div.className = 'listed-email';
          var a = (mailbox=='inbox') ? "From: " + emails[i].sender :"To: " + emails[i].recipients; 
          var b = emails[i].id;
          console.log(b);
          div.innerHTML =  a + ' Subject: ' + emails[i].subject + ' ' + emails[i].timestamp +' Body: ' + emails[i].body;
          div.addEventListener('click', () => display_email(b)); //Only puts 1 in for some reason 
          mainContainer.appendChild(div);
        }
    });
  }