import { CurriculumCourseDef } from "./types";

export const curriculum: CurriculumCourseDef = {
  courseName: "Frontend Development",
  modules: [
    {
      name: "Web & HTML Foundations",
      description: "How the internet actually works, and how to structure a webpage with HTML.",
      estimatedDuration: "1 week",
      lessons: [
        {
          title: "How the Web Works: Clients, Servers & HTTP",
          description: "What actually happens between typing a URL and seeing a page.",
          estimatedMinutes: 15,
          difficulty: "BEGINNER",
          whatIsIt:
            "The web is a system of two kinds of computers talking to each other: clients (your browser) that ask for things, and servers (remote computers) that have those things and send them back. The language they speak to make these requests is called HTTP.",
          whyItMatters:
            "Every website you'll ever build depends on this request-response cycle. Understanding it demystifies errors like '404 Not Found' or '500 Server Error', and explains why a page sometimes feels slow — it's waiting on a round trip across the internet.",
          analogy:
            "It's like ordering food at a restaurant. You (the client) tell the waiter (HTTP request) what you want from the menu. The kitchen (server) prepares it and the waiter brings it back (HTTP response). If the kitchen is out of an item, you get a message back instead of food — just like a 404 error.",
          simpleExample:
            "When you type google.com and press Enter, your browser sends a request asking 'please send me the homepage.' Google's servers respond with the HTML, CSS, and JavaScript that make up that page, and your browser assembles and displays it.",
          technicalExplanation:
            "A browser sends an HTTP request (with a method like GET or POST, a URL, and headers) to a server, usually after resolving the domain name to an IP address via DNS. The server processes the request and returns an HTTP response containing a status code (200 OK, 404 Not Found, 500 Server Error, etc.), headers, and a body — typically HTML for a webpage, or JSON for an API call.",
          codeExamples: [
            {
              title: "A raw HTTP request/response, conceptually",
              language: "text",
              code:
                "Request:\nGET /index.html HTTP/1.1\nHost: www.example.com\n\nResponse:\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n<html>...</html>",
              explanation:
                "The request line says 'GET the file /index.html from host www.example.com'. The response starts with a status line (200 OK means success) followed by headers describing the content, then the actual HTML body the browser will render."
            }
          ],
          realWorldUsage:
            "Every click, form submission, and API call in a web app is an HTTP request/response cycle. Frontend developers deal with this daily when calling backend APIs using fetch() or axios.",
          commonMistakes: [
            {
              wrong: "Assuming a webpage loads 'all at once' as a single file.",
              right: "Understanding a page loads as many separate requests: one for the HTML, then more for CSS, JS, images, and fonts.",
              explanation: "The browser parses the HTML first and then fires off additional requests for every linked resource it finds, which is why slow images or scripts can delay a page."
            }
          ],
          practice: {
            instructions: "Open your browser's DevTools (F12), go to the Network tab, and reload any website. Identify at least three separate requests being made and note their status codes.",
            hint: "Look for the 'Status' column — 200 means success, and anything starting with 4 or 5 means an error."
          },
          quiz: [
            {
              question: "In client-server terms, what is your web browser?",
              options: ["The server", "The client", "The DNS", "The HTTP protocol"],
              correctIndex: 1,
              explanation: "The browser is the client — it initiates requests and displays the responses it gets back."
            },
            {
              question: "What does an HTTP status code of 404 mean?",
              options: ["Server error", "Success", "Resource not found", "Request forbidden"],
              correctIndex: 2,
              explanation: "404 specifically means the server could not find the resource requested at that URL."
            }
          ],
          rememberThis: "Every webpage you see is the result of a conversation: your browser asks, a server answers.",
          keyTakeaways: [
            "The web runs on a client-server model.",
            "HTTP is the protocol browsers and servers use to communicate.",
            "A single webpage triggers many separate requests (HTML, CSS, JS, images).",
            "Status codes tell you whether a request succeeded, failed, or errored."
          ]
        },
        {
          title: "HTML Fundamentals & Document Structure",
          description: "Writing your first HTML document and understanding its required skeleton.",
          estimatedMinutes: 18,
          difficulty: "BEGINNER",
          whatIsIt:
            "HTML (HyperText Markup Language) is the language used to structure content on a webpage — headings, paragraphs, images, and more. It's not a programming language; it's a markup language that describes what content is and how it's organized.",
          whyItMatters:
            "Without HTML, browsers wouldn't know whether a piece of text is a heading, a paragraph, or a button. HTML gives content meaning and structure, which is the foundation every other web technology (CSS, JavaScript, React) builds on top of.",
          analogy:
            "HTML is like the skeleton of a house's blueprint — it marks out where the rooms, doors, and windows go, before you add paint (CSS) or electricity (JavaScript). Without the skeleton, there's nothing to decorate or wire up.",
          simpleExample:
            "Writing a letter, you'd naturally have a title at the top, a few paragraphs, and maybe a signature. HTML does the same for a webpage: a heading tag for the title, paragraph tags for the body text.",
          technicalExplanation:
            "Every HTML document starts with a `<!DOCTYPE html>` declaration, followed by an `<html>` root element containing a `<head>` (metadata like the title and linked stylesheets, invisible to the visitor) and a `<body>` (the actual visible content). Elements are written as tags, most with an opening and closing tag wrapping content, e.g. `<p>text</p>`.",
          codeExamples: [
            {
              title: "A minimal, valid HTML document",
              language: "html",
              code:
                "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Welcome</h1>\n  <p>This is my first webpage.</p>\n</body>\n</html>",
              explanation:
                "Line 1 tells the browser this is modern HTML5. Line 2 opens the root element with a language attribute for accessibility. The <head> holds metadata not shown to users — here just the character encoding and the browser tab's title. The <body> holds visible content: one heading and one paragraph."
            }
          ],
          realWorldUsage:
            "Every single webpage on the internet, no matter how complex the framework behind it (React, Vue, Angular), ultimately renders down to HTML that the browser understands.",
          commonMistakes: [
            {
              wrong: "<html><body><h1>Title</body></html>",
              right: "<html><body><h1>Title</h1></body></html>",
              explanation: "Forgetting to close a tag (</h1>) can cause the browser to render the rest of the page incorrectly, since it doesn't know where that element is supposed to end."
            }
          ],
          practice: {
            instructions: "Create an HTML file with a title in the browser tab, one main heading, two paragraphs about yourself, and save it. Open it directly in a browser to see it render.",
            starterCode: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title></title>\n</head>\n<body>\n\n</body>\n</html>",
            hint: "The <title> tag content shows in the browser tab, not on the page itself — that's a common point of confusion."
          },
          quiz: [
            {
              question: "Which part of an HTML document holds the content visitors actually see?",
              options: ["<head>", "<body>", "<title>", "<!DOCTYPE>"],
              correctIndex: 1,
              explanation: "The <body> contains all visible content; <head> holds metadata that isn't directly displayed."
            },
            {
              question: "What does <!DOCTYPE html> do?",
              options: ["Links a stylesheet", "Declares the document as HTML5", "Creates a heading", "Starts a comment"],
              correctIndex: 1,
              explanation: "It tells the browser to render the page using modern HTML5 standards rather than an older or quirks mode."
            }
          ],
          rememberThis: "HTML is the skeleton — everything else (style, behavior) is built on top of the structure it defines.",
          keyTakeaways: [
            "HTML structures content; it does not style or add behavior on its own.",
            "Every document needs <!DOCTYPE html>, <html>, <head>, and <body>.",
            "The <head> is for metadata; the <body> is what's visible.",
            "Most tags come in opening/closing pairs that must be properly nested."
          ]
        },
        {
          title: "Common Elements: Headings, Links, Images & Lists",
          description: "The everyday HTML tags you'll use in nearly every page you build.",
          estimatedMinutes: 20,
          difficulty: "BEGINNER",
          whatIsIt:
            "Beyond basic structure, HTML provides specific tags for common content: headings (<h1>-<h6>) for titles, <a> for clickable links, <img> for pictures, and <ul>/<ol>/<li> for lists.",
          whyItMatters:
            "Nearly every webpage needs to link to other pages, show images, and organize information into lists. Knowing these core elements lets you build real, useful pages instead of just plain text blocks.",
          analogy:
            "Think of these tags like the recurring furniture in every room of a house — every room has a light switch (headings for hierarchy), a door (links to move between spaces), and shelves (lists to organize items) even though each room looks different.",
          simpleExample:
            "A recipe blog page needs a big title (heading), a photo of the dish (image), a numbered list of steps (ordered list), and a link back to the homepage (anchor tag).",
          technicalExplanation:
            "<h1> through <h6> represent heading levels of decreasing importance, and should be used in order for accessibility, not just for font size. <a href=\"url\"> creates a hyperlink where href specifies the destination. <img src=\"path\" alt=\"description\"> embeds an image, where alt is mandatory for accessibility and shown if the image fails to load. <ul> creates an unordered (bulleted) list, <ol> an ordered (numbered) one, both containing <li> list items.",
          codeExamples: [
            {
              title: "Combining headings, a link, an image, and a list",
              language: "html",
              code:
                "<h1>My Travel Blog</h1>\n<h2>Top 3 Destinations</h2>\n<img src=\"paris.jpg\" alt=\"Eiffel Tower at sunset\">\n<ol>\n  <li>Paris</li>\n  <li>Tokyo</li>\n  <li>Cape Town</li>\n</ol>\n<a href=\"/about.html\">About Me</a>",
              explanation:
                "The <h1> is the page's main title and <h2> a subheading below it. The <img> shows a picture with descriptive alt text for screen readers. The <ol> numbers the three destinations automatically. The <a> links to a different page on the same site using a relative path."
            }
          ],
          realWorldUsage:
            "News sites, blogs, e-commerce product pages, and documentation sites all rely heavily on headings for hierarchy, images for products/media, links for navigation, and lists for steps or features.",
          commonMistakes: [
            {
              wrong: "<img src=\"cat.jpg\">",
              right: "<img src=\"cat.jpg\" alt=\"A gray cat sleeping on a couch\">",
              explanation: "Omitting alt text hurts accessibility (screen readers have nothing to announce) and SEO, and leaves nothing shown if the image fails to load."
            }
          ],
          practice: {
            instructions: "Build a simple 'favorite movies' page: an <h1> title, an image (any URL), an unordered list of 3 movies, and a link to IMDb.",
            hint: "You can use an image URL from the internet directly in src, e.g. src=\"https://example.com/movie.jpg\"."
          },
          quiz: [
            {
              question: "Which attribute is required on <img> for accessibility?",
              options: ["src", "alt", "title", "width"],
              correctIndex: 1,
              explanation: "alt provides a text alternative for screen readers and for when the image can't load; src alone is not enough for accessibility."
            },
            {
              question: "Which tag creates a numbered list?",
              options: ["<ul>", "<li>", "<ol>", "<dl>"],
              correctIndex: 2,
              explanation: "<ol> stands for 'ordered list' and automatically numbers its <li> items; <ul> creates bullets instead."
            }
          ],
          rememberThis: "Headings, links, images, and lists are the everyday furniture of the web — you'll reach for them constantly.",
          keyTakeaways: [
            "Use heading levels (h1-h6) for hierarchy, not just visual size.",
            "<a href> creates navigation between pages or sections.",
            "Every <img> needs meaningful alt text.",
            "<ul> is unordered/bulleted, <ol> is numbered — both use <li> for items."
          ]
        },
        {
          title: "Semantic HTML & Accessibility Basics",
          description: "Writing HTML that means something, so browsers, screen readers, and search engines understand it.",
          estimatedMinutes: 18,
          difficulty: "BEGINNER",
          whatIsIt:
            "Semantic HTML means using tags that describe the meaning of their content, like <nav>, <header>, <main>, <article>, and <footer>, instead of generic <div>s for everything. Accessibility means making sure people using assistive technology, like screen readers, can still understand and use your page.",
          whyItMatters:
            "Screen readers, search engines, and browsers all rely on semantic tags to understand a page's structure. A page built entirely from unlabeled <div>s is a 'div soup' that's harder to navigate for assistive technology and worse for SEO.",
          analogy:
            "It's the difference between a building with labeled rooms — 'Reception', 'Exit', 'Restroom' — and one with unmarked identical doors. Labeled rooms help everyone, especially someone who can't see well, find their way without guessing.",
          simpleExample:
            "Instead of wrapping your site's navigation links in a generic <div class=\"nav\">, wrapping them in a <nav> tag tells browsers and screen readers directly: 'this block is navigation,' letting a screen reader user jump straight to it.",
          technicalExplanation:
            "HTML5 introduced semantic elements: <header> (intro/branding), <nav> (navigation links), <main> (primary content, one per page), <article> (self-contained content), <section> (thematic grouping), <aside> (tangential content), and <footer>. Screen readers use these landmarks to let users jump between page regions, and search engines use them to better index content.",
          codeExamples: [
            {
              title: "Semantic layout vs. div soup",
              language: "html",
              code:
                "<!-- Semantic -->\n<header><h1>My Blog</h1></header>\n<nav><a href=\"/\">Home</a></nav>\n<main>\n  <article>\n    <h2>Post Title</h2>\n    <p>Content...</p>\n  </article>\n</main>\n<footer>&copy; 2026</footer>",
              explanation:
                "Each region is labeled by what it means: <header> for the top branding area, <nav> for links, <main> for the core content (only one per page), <article> for a standalone post, and <footer> for closing info. A screen reader can announce 'navigation landmark' or 'main content landmark' directly from this."
            }
          ],
          realWorldUsage:
            "Companies are legally required in many countries (e.g. under ADA/WCAG guidelines) to make websites accessible; semantic HTML is the first and cheapest step toward that compliance, and is also a ranking factor for SEO.",
          commonMistakes: [
            {
              wrong: "<div class=\"header\"><div class=\"nav\">...</div></div>",
              right: "<header><nav>...</nav></header>",
              explanation: "A <div> carries no meaning to assistive technology no matter what class name you give it — only real semantic tags are announced as landmarks by screen readers."
            }
          ],
          practice: {
            instructions: "Take a page you built in an earlier lesson and rewrite its layout using <header>, <nav>, <main>, and <footer> instead of generic <div>s.",
            hint: "There should only be one <main> and ideally one <h1> per page."
          },
          quiz: [
            {
              question: "Why prefer <nav> over <div class=\"nav\">?",
              options: [
                "It loads faster",
                "Screen readers and browsers recognize it as a navigation landmark",
                "It supports more CSS properties",
                "There is no real difference"
              ],
              correctIndex: 1,
              explanation: "Semantic tags carry built-in meaning that assistive technology and browsers understand, regardless of class names."
            },
            {
              question: "How many <main> elements should a page typically have?",
              options: ["As many as needed", "Exactly one", "None, it's optional and unlimited", "Only inside forms"],
              correctIndex: 1,
              explanation: "There should be exactly one <main> per page, representing the primary content, to avoid confusing assistive technology."
            }
          ],
          rememberThis: "If a <div> could be a <nav>, <header>, or <main> instead, it probably should be.",
          keyTakeaways: [
            "Semantic tags describe meaning, not just appearance.",
            "They help screen readers, search engines, and other developers understand your page.",
            "Common landmarks: header, nav, main, article, section, aside, footer.",
            "Accessibility isn't optional polish — it's a core part of good HTML."
          ]
        },
        {
          title: "Forms & Input Types",
          description: "Collecting user input with HTML forms, inputs, and labels.",
          estimatedMinutes: 22,
          difficulty: "BEGINNER",
          whatIsIt:
            "An HTML <form> is a container that collects user input — text, choices, files — through elements like <input>, <select>, and <textarea>, then typically sends that data somewhere (like a server) when submitted.",
          whyItMatters:
            "Nearly every interactive site needs forms: login pages, search bars, checkout pages, surveys. Understanding forms is essential before you can build anything that reacts to what a user types or selects.",
          analogy:
            "A form is like a paper application at a government office: labeled blank fields ask for specific pieces of information (name, date of birth, signature), and once you're done, you hand the whole packet in at once (submit).",
          simpleExample:
            "A login form asks for an email and password in two separate boxes, then has a 'Log In' button that sends both values together when clicked.",
          technicalExplanation:
            "A <form> wraps input elements and defines where (action) and how (method: GET or POST) data is sent on submission. <input> has a type attribute controlling its behavior: text, email, password, checkbox, radio, number, date, file, and more, many with built-in browser validation. Every input should be paired with a <label> (linked via matching for/id attributes) so screen readers and click targets work correctly.",
          codeExamples: [
            {
              title: "A basic labeled sign-up form",
              language: "html",
              code:
                "<form action=\"/signup\" method=\"POST\">\n  <label for=\"email\">Email</label>\n  <input type=\"email\" id=\"email\" name=\"email\" required>\n\n  <label for=\"password\">Password</label>\n  <input type=\"password\" id=\"password\" name=\"password\" required minlength=\"8\">\n\n  <button type=\"submit\">Sign Up</button>\n</form>",
              explanation:
                "The <form> will POST its data to /signup on submit. Each <label>'s for matches its <input>'s id, linking them so clicking the label focuses the input. type=\"email\" gives built-in format validation; required blocks submission if empty; minlength enforces a minimum password length, all without any JavaScript."
            }
          ],
          realWorldUsage:
            "Login/signup pages, checkout flows, search bars, contact forms, and surveys are all built on HTML forms — even in React apps, the underlying DOM elements are the same <input>, <form>, and <label> tags.",
          commonMistakes: [
            {
              wrong: "<input type=\"text\" placeholder=\"Email\">",
              right: "<label for=\"email\">Email</label><input type=\"email\" id=\"email\" placeholder=\"you@example.com\">",
              explanation: "Placeholder text disappears once typing starts and isn't a substitute for a real <label>, which is what screen readers and clickable targets actually rely on."
            }
          ],
          practice: {
            instructions: "Build a feedback form with a labeled text input for name, a labeled email input, a labeled textarea for comments, and a submit button.",
            starterCode: "<form>\n\n</form>",
            hint: "Don't forget matching for/id pairs between each <label> and its <input> or <textarea>."
          },
          quiz: [
            {
              question: "What connects a <label> to its <input>?",
              options: ["Matching name attributes", "Matching for/id attributes", "Being adjacent in the HTML", "The type attribute"],
              correctIndex: 1,
              explanation: "The label's for attribute must match the input's id for them to be programmatically linked."
            },
            {
              question: "Which input type gives built-in email format validation?",
              options: ["type=\"text\"", "type=\"string\"", "type=\"email\"", "type=\"validate\""],
              correctIndex: 2,
              explanation: "type=\"email\" tells the browser to check for a valid email-like format before allowing submission."
            }
          ],
          rememberThis: "A form without labels is like an application with blank, unmarked boxes — technically fillable, but confusing and inaccessible.",
          keyTakeaways: [
            "Forms collect and submit user input.",
            "Input types (email, password, number, etc.) provide free built-in validation.",
            "Always pair inputs with real <label> elements via for/id.",
            "required and minlength/maxlength enforce basic rules without JavaScript."
          ]
        }
      ]
    },
    {
      name: "CSS & Responsive Design",
      description: "Styling HTML with CSS, laying out pages with Flexbox and Grid, and making designs work on any screen.",
      estimatedDuration: "1.5 weeks",
      lessons: [
        {
          title: "CSS Fundamentals & Selectors",
          description: "Applying visual styles to HTML elements and targeting exactly the ones you want.",
          estimatedMinutes: 18,
          difficulty: "BEGINNER",
          whatIsIt:
            "CSS (Cascading Style Sheets) is the language used to style HTML — colors, fonts, spacing, layout. A CSS rule pairs a selector (which elements to target) with declarations (what style to apply).",
          whyItMatters:
            "HTML alone produces plain, unstyled text and boxes. CSS is what turns that raw structure into something visually usable and on-brand — every real website's look and feel comes from CSS.",
          analogy:
            "If HTML is the unpainted walls and bare furniture of a house, CSS is the paint, wallpaper, and interior design — it doesn't change what a room is for, just how it looks and feels.",
          simpleExample:
            "You could tell HTML 'this is a paragraph,' and separately tell CSS 'make all paragraphs gray and use a larger, readable font' — one rule affects every paragraph on the page at once.",
          technicalExplanation:
            "A CSS rule looks like `selector { property: value; }`. Selectors can target by tag name (p), class (.card), id (#header), or combinations/descendants (nav a). When multiple rules could apply to the same element, CSS uses specificity (id > class > tag) and source order (later wins ties) to decide which one 'cascades' through — hence the name.",
          codeExamples: [
            {
              title: "Selecting by tag, class, and id",
              language: "css",
              code:
                "p {\n  color: #333;\n  font-size: 16px;\n}\n\n.highlight {\n  background-color: yellow;\n}\n\n#main-title {\n  font-weight: bold;\n}",
              explanation:
                "The first rule styles every <p> tag on the page. The second, using a dot for class selectors, only applies to elements with class=\"highlight\", so you can opt specific elements in. The third, using a hash for id selectors, applies to the single element with id=\"main-title\" — ids should be unique per page."
            }
          ],
          realWorldUsage:
            "Every visual design decision on a real website — brand colors, spacing, fonts, layout — is implemented through CSS, whether written by hand or generated by a framework like Tailwind or styled-components.",
          commonMistakes: [
            {
              wrong: "#header { color: blue; } .header { color: red; } <div id=\"header\" class=\"header\">",
              right: "Understand that #header (id selector) beats .header (class selector) in specificity, so the text renders blue, not red.",
              explanation: "IDs are more specific than classes, so when two rules conflict, the id selector wins regardless of the order they're written in the file."
            }
          ],
          practice: {
            instructions: "Style a paragraph two ways: give it a class that sets its color to blue, and separately give its parent div an id that sets a background color. Observe both apply at once since they target different properties.",
            hint: "Class selectors start with a dot (.name), id selectors start with a hash (#name)."
          },
          quiz: [
            {
              question: "Which selector targets a single, unique element?",
              options: [".card", "p", "#header", "*"],
              correctIndex: 2,
              explanation: "The # (id) selector is meant to target one unique element per page, unlike classes which can apply to many."
            },
            {
              question: "If a tag selector and a class selector both set the same property on the same element, which wins?",
              options: ["The tag selector always", "The class selector, because classes are more specific", "Whichever is defined last, regardless of type", "Neither applies"],
              correctIndex: 1,
              explanation: "Class selectors are more specific than tag/element selectors, so they take precedence regardless of order."
            }
          ],
          rememberThis: "CSS selectors answer 'which elements?' and declarations answer 'what style?' — specificity decides who wins when rules collide.",
          keyTakeaways: [
            "CSS separates visual styling from HTML structure.",
            "Selectors can target by tag, class, or id.",
            "Specificity (id > class > tag) determines which conflicting rule applies.",
            "Classes are reusable across many elements; ids should be unique."
          ]
        },
        {
          title: "The Box Model",
          description: "Understanding how content, padding, border, and margin combine to size every element.",
          estimatedMinutes: 20,
          difficulty: "BEGINNER",
          whatIsIt:
            "The box model describes how every HTML element is rendered as a rectangular box made of four layers, from inside out: content, padding, border, and margin.",
          whyItMatters:
            "Spacing bugs — elements overlapping, unexpected gaps, layouts that don't line up — are almost always a box model misunderstanding. Mastering it is the single biggest unlock for controlling layout.",
          analogy:
            "Think of a framed photo on a wall: the photo itself is the content, the mat around it is the padding, the frame is the border, and the empty wall space you leave around the frame before hanging the next photo is the margin.",
          simpleExample:
            "A button with text inside it: the text is the content, the space between the text and the button's edge is padding, the button's visible outline is the border, and the gap between that button and the next one is margin.",
          technicalExplanation:
            "By default (content-box), an element's declared width/height applies only to the content area — padding and border are added on top, making the rendered box bigger than the declared size. Setting `box-sizing: border-box` changes this so width/height include padding and border, which is why most real-world CSS resets apply border-box globally. Margin sits outside the border and can collapse between adjacent vertical margins.",
          codeExamples: [
            {
              title: "content-box vs border-box",
              language: "css",
              code:
                "* {\n  box-sizing: border-box;\n}\n\n.card {\n  width: 300px;\n  padding: 20px;\n  border: 2px solid #ccc;\n  margin: 16px;\n}",
              explanation:
                "The universal selector (*) applies border-box to everything, meaning .card's total rendered width stays exactly 300px, with padding and border squeezed inside that width instead of added on top. Without box-sizing: border-box, the actual rendered width would be 300 + 40 (padding) + 4 (border) = 344px."
            }
          ],
          realWorldUsage:
            "Nearly every CSS reset or framework (Bootstrap, Tailwind) sets box-sizing: border-box globally on day one because it makes sizing predictable — this is considered a best practice on virtually every real project.",
          commonMistakes: [
            {
              wrong: "width: 100%; padding: 20px; /* with default content-box */",
              right: "box-sizing: border-box; width: 100%; padding: 20px;",
              explanation: "With content-box, padding is added on top of a 100% width, pushing the element wider than its container and often causing unexpected horizontal overflow or scrollbars."
            }
          ],
          practice: {
            instructions: "Create a div with a declared width of 200px, 20px padding, and a 5px border, once with default box-sizing and once with border-box. Use DevTools to inspect and compare the actual rendered width.",
            hint: "In Chrome DevTools, the 'Computed' tab shows a visual box model diagram for the selected element."
          },
          quiz: [
            {
              question: "With the default box-sizing (content-box), does padding increase an element's total rendered size?",
              options: ["No, padding is inside the declared width", "Yes, padding is added on top of the declared width", "Only if a border is also set", "Padding is ignored without border-box"],
              correctIndex: 1,
              explanation: "In content-box (the default), width/height apply only to content, so padding and border add extra size on top."
            },
            {
              question: "What does box-sizing: border-box do?",
              options: [
                "Removes borders from all elements",
                "Makes width/height include padding and border",
                "Makes margins collapse",
                "Disables the box model entirely"
              ],
              correctIndex: 1,
              explanation: "border-box folds padding and border into the declared width/height, so the total rendered size matches what you set."
            }
          ],
          rememberThis: "Content, padding, border, margin — from the inside out, like a framed photo on a wall.",
          keyTakeaways: [
            "Every element is a box: content, padding, border, margin.",
            "Default box-sizing (content-box) adds padding/border on top of width.",
            "border-box makes width/height include padding and border — use it almost always.",
            "Margin sits outside the border and creates space between elements."
          ]
        },
        {
          title: "Flexbox: One-Dimensional Layout",
          description: "Arranging items in a row or column with alignment and spacing that just works.",
          estimatedMinutes: 25,
          difficulty: "INTERMEDIATE",
          whatIsIt:
            "Flexbox is a CSS layout system for arranging items along a single axis — a row or a column — with powerful, simple control over alignment, spacing, and ordering, without hacks like floats.",
          whyItMatters:
            "Before Flexbox, centering something vertically or making items evenly space themselves required awkward workarounds. Flexbox solves layout problems like navbars, card rows, and centering in just a few lines.",
          analogy:
            "Think of Flexbox like arranging books on a single shelf: you decide if they're packed tightly to the left, spread evenly across the whole shelf, or centered — and whether short and tall books line up at the top, middle, or bottom of the shelf.",
          simpleExample:
            "A navigation bar with a logo on the left and three links on the right, all vertically centered, is a classic Flexbox job: one line of CSS lines everything up perfectly.",
          technicalExplanation:
            "Setting `display: flex` on a container makes its direct children flex items along a main axis (row by default). `justify-content` aligns items along the main axis (start, center, space-between, etc.), `align-items` aligns them along the cross axis, and `flex-direction` can switch the main axis to column. Individual items can grow, shrink, or take a fixed basis via the `flex` shorthand.",
          codeExamples: [
            {
              title: "A navbar with Flexbox",
              language: "css",
              code:
                ".navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px;\n}",
              explanation:
                "display: flex turns .navbar's children into a flex row. justify-content: space-between pushes the first child to the left edge and the last to the right edge, spreading any others evenly between. align-items: center vertically centers every child regardless of its height."
            }
          ],
          realWorldUsage:
            "Flexbox is the default choice for navbars, button groups, card rows, form layouts, and centering content — it's used in essentially every modern website and is a staple of component-based UI libraries.",
          commonMistakes: [
            {
              wrong: "Trying to center a div with margin: auto alone and no display: flex on the parent.",
              right: ".parent { display: flex; justify-content: center; align-items: center; }",
              explanation: "margin: auto only centers horizontally in normal document flow; to center both horizontally and vertically reliably, the parent needs display: flex with justify-content and align-items set."
            }
          ],
          practice: {
            instructions: "Build a row of three equal-width cards with even spacing between them, all vertically centered regardless of their individual heights, using only Flexbox.",
            starterCode: ".container {\n  display: flex;\n  /* add your properties here */\n}",
            hint: "justify-content: space-between or space-around controls horizontal spacing; align-items: center controls vertical alignment."
          },
          quiz: [
            {
              question: "What does justify-content control in a default (row) flex container?",
              options: ["Vertical alignment", "Horizontal alignment/spacing along the main axis", "Font size of items", "The number of items per row"],
              correctIndex: 1,
              explanation: "In a row-direction flex container, justify-content controls alignment and spacing along the horizontal main axis."
            },
            {
              question: "Which property switches the main axis from row to column?",
              options: ["flex-wrap", "align-content", "flex-direction", "justify-items"],
              correctIndex: 2,
              explanation: "flex-direction: column makes items stack vertically, making the vertical axis the new main axis."
            }
          ],
          rememberThis: "Flexbox thinks in one line at a time — a row or a column — and makes alignment along it almost effortless.",
          keyTakeaways: [
            "display: flex turns direct children into flex items along one axis.",
            "justify-content aligns along the main axis; align-items aligns along the cross axis.",
            "flex-direction switches between row and column layouts.",
            "Flexbox is ideal for navbars, button rows, and centering content."
          ]
        },
        {
          title: "CSS Grid: Two-Dimensional Layout",
          description: "Building full page layouts with rows and columns at the same time.",
          estimatedMinutes: 25,
          difficulty: "INTERMEDIATE",
          whatIsIt:
            "CSS Grid is a layout system for arranging items in rows and columns simultaneously, unlike Flexbox which handles one direction at a time. You define a grid structure on a container, then place items into it.",
          whyItMatters:
            "Full-page layouts — a header, sidebar, main content, and footer — need control over both rows and columns at once. Grid handles this directly, where Flexbox would require nesting multiple containers.",
          analogy:
            "If Flexbox is arranging books on one shelf, Grid is designing the entire bookshelf unit — deciding how many shelves (rows) and columns of cubbies there are, and which item goes in which cubby, all at once.",
          simpleExample:
            "A dashboard page with a fixed sidebar on the left and a main content area on the right, with a header spanning the full width on top, is a natural fit for a 2-column, 2-row Grid layout.",
          technicalExplanation:
            "Setting `display: grid` on a container lets you define `grid-template-columns` and `grid-template-rows` to size the tracks (using fixed units, percentages, or the flexible `fr` unit). Children are placed into cells automatically or explicitly positioned with `grid-column`/`grid-row`. The `gap` property adds spacing between tracks without needing margins on individual items.",
          codeExamples: [
            {
              title: "A page layout with header, sidebar, and main content",
              language: "css",
              code:
                ".page {\n  display: grid;\n  grid-template-columns: 200px 1fr;\n  grid-template-rows: 60px 1fr;\n  grid-template-areas:\n    \"header header\"\n    \"sidebar main\";\n  gap: 12px;\n}\n.header { grid-area: header; }\n.sidebar { grid-area: sidebar; }\n.main { grid-area: main; }",
              explanation:
                "grid-template-columns creates a fixed 200px sidebar column and a flexible remaining column (1fr). grid-template-areas names regions of the grid visually, matching the layout's shape, and each child is assigned to a named area with grid-area — a very readable way to define a page skeleton."
            }
          ],
          realWorldUsage:
            "Grid is the standard tool for full-page layouts, image galleries, and dashboards in modern frontend development, often paired with Flexbox for the smaller components inside each grid cell.",
          commonMistakes: [
            {
              wrong: "Trying to build a full page header/sidebar/main/footer layout with nested Flexbox containers.",
              right: "Use CSS Grid with grid-template-areas for the overall page skeleton, and Flexbox inside individual sections.",
              explanation: "Flexbox can technically fake 2D layouts through nesting, but it becomes fragile and hard to read; Grid was purpose-built for exactly this kind of layout."
            }
          ],
          practice: {
            instructions: "Create a 3-column photo gallery grid where images automatically wrap to new rows, with 16px gaps between all images.",
            starterCode: ".gallery {\n  display: grid;\n  /* set columns and gap */\n}",
            hint: "grid-template-columns: repeat(3, 1fr) creates three equal columns; gap adds spacing between all cells."
          },
          quiz: [
            {
              question: "What is the key difference between Grid and Flexbox?",
              options: [
                "Grid only works in Chrome",
                "Grid controls two dimensions (rows and columns) at once, Flexbox controls one",
                "Flexbox is newer than Grid",
                "There is no real difference"
              ],
              correctIndex: 1,
              explanation: "Grid is inherently two-dimensional, letting you define rows and columns together, while Flexbox lays items out along a single axis."
            },
            {
              question: "What does the fr unit represent in Grid?",
              options: ["A fixed number of pixels", "A fraction of the remaining available space", "Font size ratio", "Frames per second for animation"],
              correctIndex: 1,
              explanation: "fr divides remaining space proportionally among tracks, making it ideal for flexible column/row sizing."
            }
          ],
          rememberThis: "Reach for Grid when you're designing the whole page's skeleton, and Flexbox for the pieces that live inside it.",
          keyTakeaways: [
            "Grid arranges items in rows and columns simultaneously.",
            "grid-template-columns/rows define the track sizes.",
            "grid-template-areas gives a readable, visual way to define layouts.",
            "Grid and Flexbox are complementary, not competing, tools."
          ]
        },
        {
          title: "Responsive Design & Media Queries",
          description: "Making a layout adapt gracefully from a phone screen to a desktop monitor.",
          estimatedMinutes: 22,
          difficulty: "INTERMEDIATE",
          whatIsIt:
            "Responsive design means building a layout that automatically adjusts to different screen sizes, rather than looking correct only on one fixed width. Media queries are the CSS feature that let you apply different styles based on the viewport's size.",
          whyItMatters:
            "Users visit sites from phones, tablets, laptops, and huge monitors. A layout that isn't responsive either breaks (overflowing text, tiny unreadable buttons) or forces users to zoom and scroll horizontally — a fast way to lose visitors.",
          analogy:
            "It's like clothing designed to stretch and adjust to fit different body sizes rather than a rigid one-size suit — the same garment looks good whether the wearer is small or tall.",
          simpleExample:
            "A 3-column product grid on a desktop screen might need to collapse to a single column on a phone, since three columns would be too squeezed to read.",
          technicalExplanation:
            "A media query, `@media (max-width: 768px) { ... }`, applies its enclosed CSS rules only when the condition (e.g. viewport width at or below 768px) is true. The mobile-first approach writes base styles for small screens first, then uses `min-width` media queries to add complexity for larger screens. The viewport meta tag (`<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">`) is required in HTML for media queries to work correctly on mobile devices.",
          codeExamples: [
            {
              title: "Mobile-first responsive grid",
              language: "css",
              code:
                ".grid {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 16px;\n}\n\n@media (min-width: 768px) {\n  .grid {\n    grid-template-columns: repeat(3, 1fr);\n  }\n}",
              explanation:
                "The base .grid rule (outside any media query) is a single column, meant for small screens by default. The media query then overrides grid-template-columns to three equal columns only once the viewport is at least 768px wide — a tablet or larger."
            }
          ],
          realWorldUsage:
            "Every production website today must be responsive — e-commerce sites, banking apps, and portfolios all need to work equally well on a phone in someone's hand and a widescreen monitor.",
          commonMistakes: [
            {
              wrong: "Forgetting <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> in the HTML head.",
              right: "Always include the viewport meta tag so mobile browsers don't render the page at a fake 'desktop' width and then shrink it.",
              explanation: "Without this tag, most mobile browsers assume a wide desktop viewport and zoom out, making media queries behave unpredictably."
            }
          ],
          practice: {
            instructions: "Take the 3-column card layout from the Flexbox lesson and make it stack into a single column on screens narrower than 600px using a media query.",
            hint: "Write the mobile (single-column) styles as the default, then use @media (min-width: 600px) to switch to a row layout for larger screens."
          },
          quiz: [
            {
              question: "In mobile-first design, which comes first in your CSS?",
              options: ["Desktop styles, then overridden for mobile", "Mobile/base styles, then enhanced with min-width media queries", "There is no defined order", "Print styles"],
              correctIndex: 1,
              explanation: "Mobile-first means writing the simplest, small-screen styles as the default and layering on complexity for larger screens via min-width queries."
            },
            {
              question: "What does the viewport meta tag do?",
              options: [
                "Adds a favicon",
                "Tells mobile browsers to use the actual device width instead of a fake desktop width",
                "Enables JavaScript",
                "Sets the page's background color"
              ],
              correctIndex: 1,
              explanation: "It ensures the browser renders the page at the device's real width, which is required for media queries to behave as expected on mobile."
            }
          ],
          rememberThis: "Design for the smallest screen first, then progressively add layout complexity as space allows.",
          keyTakeaways: [
            "Media queries apply CSS conditionally based on viewport size.",
            "Mobile-first means writing base styles for small screens, then enhancing for larger ones.",
            "The viewport meta tag is required for responsive design to work on mobile.",
            "Responsive design is a requirement, not an optional extra, for real websites."
          ]
        },
        {
          title: "Typography & Color Basics",
          description: "Choosing fonts, sizes, and colors that make content readable and visually consistent.",
          estimatedMinutes: 15,
          difficulty: "BEGINNER",
          whatIsIt:
            "Typography is the styling of text — font family, size, weight, and line spacing. Color in CSS can be defined in several formats (named colors, hex, rgb, hsl) and applied to text, backgrounds, and borders.",
          whyItMatters:
            "Poor typography and color choices make even well-structured pages hard to read or unpleasant to use. Good typography and consistent color improve readability, accessibility, and how professional a site feels.",
          analogy:
            "Typography and color are like the tone of voice and outfit a speaker chooses for a presentation — the same words land very differently depending on how clearly and appropriately they're presented.",
          simpleExample:
            "Long paragraphs set in a huge, condensed font with low contrast against the background are exhausting to read; the same text in a comfortable size with generous line spacing and strong contrast is easy to scan.",
          technicalExplanation:
            "`font-family` sets the typeface (with fallback fonts), `font-size` and `font-weight` control size and boldness, and `line-height` controls vertical spacing between lines of text, which strongly affects readability. Colors can be written as named keywords (red), hex (#3366ff), rgb(51, 102, 255), or hsl(220, 100%, 60%) — hsl is often easiest to reason about since you adjust hue, saturation, and lightness independently. Sufficient contrast between text and background color is also an accessibility requirement (WCAG).",
          codeExamples: [
            {
              title: "Readable body text styling",
              language: "css",
              code:
                "body {\n  font-family: 'Inter', Arial, sans-serif;\n  font-size: 16px;\n  line-height: 1.6;\n  color: #222222;\n  background-color: #ffffff;\n}",
              explanation:
                "font-family lists a preferred font (Inter) with fallbacks in case it isn't available. 16px is a comfortable base reading size. line-height: 1.6 spaces lines out for easier scanning. The dark gray text (#222) on white background gives strong, comfortable contrast rather than pure black on white."
            }
          ],
          realWorldUsage:
            "Design systems at real companies (Material Design, Apple's Human Interface Guidelines) define strict typography scales and color palettes precisely because consistent type and color make products feel polished and trustworthy.",
          commonMistakes: [
            {
              wrong: "color: #777; background-color: #999; /* low contrast gray-on-gray text */",
              right: "color: #222; background-color: #ffffff; /* strong contrast */",
              explanation: "Low contrast between text and background fails accessibility guidelines and is genuinely hard to read, especially for users with low vision."
            }
          ],
          practice: {
            instructions: "Style a paragraph of at least three sentences with a readable font-size (16-18px), a line-height around 1.5-1.6, and a text/background color combination with strong contrast.",
            hint: "Use a free contrast checker tool to verify your color combination meets accessibility standards if unsure."
          },
          quiz: [
            {
              question: "What does line-height control?",
              options: ["The width of text", "Vertical spacing between lines of text", "The font's boldness", "The color of text"],
              correctIndex: 1,
              explanation: "line-height sets the vertical space each line of text occupies, directly affecting how easy a paragraph is to read."
            },
            {
              question: "Why is text/background contrast important?",
              options: ["It only matters for print", "It affects load time", "It's an accessibility requirement for readability", "It has no real effect"],
              correctIndex: 2,
              explanation: "Sufficient contrast is required by accessibility guidelines (WCAG) so users with low vision or color blindness can still read content."
            }
          ],
          rememberThis: "Typography and color aren't decoration — they decide whether your content is actually readable.",
          keyTakeaways: [
            "font-family, font-size, and line-height together control text readability.",
            "Colors can be written as keywords, hex, rgb, or hsl.",
            "Strong contrast between text and background is an accessibility must, not a preference.",
            "Consistent typography and color make a site feel professional."
          ]
        }
      ]
    },
    {
      name: "JavaScript Essentials",
      description: "Programming the behavior of a webpage: values, logic, the DOM, and modern async code.",
      estimatedDuration: "2 weeks",
      lessons: [
        {
          title: "Variables & Data Types",
          description: "Storing values and understanding the different kinds of data JavaScript works with.",
          estimatedMinutes: 18,
          difficulty: "BEGINNER",
          whatIsIt:
            "A variable is a named container for a value that your program can reference and change later. JavaScript's core data types include strings (text), numbers, booleans (true/false), arrays, objects, null, and undefined.",
          whyItMatters:
            "Programs need to store and manipulate information — a username, a price, whether a checkbox is checked. Variables and types are the absolute foundation everything else in JavaScript is built on.",
          analogy:
            "A variable is like a labeled jar in a pantry: the label (name) stays fixed, but you can look inside to see what's stored (read it) or swap its contents (reassign it) — and the type tells you whether the jar holds flour, sugar, or rice.",
          simpleExample:
            "Storing a shopping list total as a number (49.99), a customer's name as a string (\"Amit\"), and whether they want gift wrap as a boolean (true) are three different data types working together in one order.",
          technicalExplanation:
            "`let` declares a variable that can be reassigned; `const` declares one that cannot be reassigned (though objects/arrays it holds can still be mutated internally); `var` is the older, function-scoped form best avoided. JavaScript is dynamically typed — a variable's type is determined by its current value, checkable with `typeof`. Primitive types (string, number, boolean, null, undefined, symbol) are copied by value; objects and arrays are reference types, copied by reference.",
          codeExamples: [
            {
              title: "Declaring variables of different types",
              language: "javascript",
              code:
                "const userName = \"Amit\";\nlet cartTotal = 49.99;\nlet giftWrap = true;\nlet coupon = null;\n\nconsole.log(typeof userName, typeof cartTotal, typeof giftWrap);",
              explanation:
                "userName is a const string that won't be reassigned. cartTotal is a let number that might change as items are added. giftWrap is a boolean flag. coupon is explicitly set to null to represent 'no value yet.' typeof returns each variable's type as a string for inspection."
            }
          ],
          realWorldUsage:
            "Every JavaScript application — from a to-do list to a banking dashboard — stores state (user info, form values, totals, flags) in variables of these core types.",
          commonMistakes: [
            {
              wrong: "let total = \"49.99\"; total = total + 10; // \"49.9910\"",
              right: "let total = 49.99; total = total + 10; // 59.99",
              explanation: "Storing a number as a string causes + to concatenate text instead of adding numerically — a very common source of subtle bugs."
            }
          ],
          practice: {
            instructions: "Declare variables for a product: productName (string), price (number), inStock (boolean), and discountCode (should start as null). Log the typeof each one.",
            hint: "Use const for values that won't change and let for ones that might."
          },
          quiz: [
            {
              question: "Which data type would you use to represent 'is the item in stock'?",
              options: ["string", "number", "boolean", "null"],
              correctIndex: 2,
              explanation: "A true/false condition is exactly what the boolean type represents."
            },
            {
              question: "What happens when you use + between a string number and a real number, e.g. \"5\" + 3?",
              options: ["8", "\"53\" (string concatenation)", "An error", "undefined"],
              correctIndex: 1,
              explanation: "JavaScript coerces the number into a string and concatenates them, producing \"53\" rather than adding numerically."
            }
          ],
          rememberThis: "The type of a value determines how JavaScript's operators behave on it — always know what type you're actually holding.",
          keyTakeaways: [
            "let is reassignable, const is not; prefer const by default.",
            "Core types: string, number, boolean, object, array, null, undefined.",
            "typeof lets you inspect a variable's current type at runtime.",
            "Mixing strings and numbers with + causes concatenation, not addition."
          ]
        },
        {
          title: "Functions & Scope",
          description: "Packaging reusable logic into functions and understanding where variables are visible.",
          estimatedMinutes: 20,
          difficulty: "BEGINNER",
          whatIsIt:
            "A function is a reusable block of code that runs when called, optionally taking inputs (parameters) and producing an output (a return value). Scope determines where in your code a variable can be accessed.",
          whyItMatters:
            "Without functions, you'd repeat the same logic everywhere it's needed, and any bug fix would require changing it in every copy. Scope prevents variables in one part of a program from accidentally clashing with variables elsewhere.",
          analogy:
            "A function is like a coffee machine: you put in inputs (water, beans — parameters), press a button (call it), and get a consistent output (a cup of coffee — the return value) without needing to know its internal wiring each time.",
          simpleExample:
            "Instead of writing the math to calculate a discount every time it's needed, you write one applyDiscount function once, then call it wherever a discount needs calculating.",
          technicalExplanation:
            "Functions can be declared (`function name() {}`), assigned as expressions, or written as arrow functions (`() => {}`). Variables declared with let/const are block-scoped — visible only within the {} they're declared in — while var is function-scoped. A function creates its own scope; variables inside it aren't visible outside, but inner functions can access (\"close over\") variables from their enclosing scope, a concept called closures.",
          codeExamples: [
            {
              title: "A function with parameters, a return value, and scope",
              language: "javascript",
              code:
                "function applyDiscount(price, percentOff) {\n  const discount = price * (percentOff / 100);\n  return price - discount;\n}\n\nconst finalPrice = applyDiscount(200, 10);\nconsole.log(finalPrice); // 180\nconsole.log(discount);   // ReferenceError: discount is not defined",
              explanation:
                "applyDiscount takes two parameters and returns a computed value. discount is declared with const inside the function, so it only exists in that function's scope — trying to access it outside throws a ReferenceError, which is scope working correctly."
            }
          ],
          realWorldUsage:
            "Functions are the basic unit of logic reuse in every JavaScript codebase — validating a form, formatting a date, calculating a total, or handling a button click are all implemented as functions.",
          commonMistakes: [
            {
              wrong: "function greet() { console.log(message); } var message = \"Hi\"; greet();",
              right: "Declare and initialize variables a function needs before relying on them, and prefer passing values as parameters instead of relying on outer scope.",
              explanation: "Relying on outer/global variables inside a function makes code fragile and hard to trace — passing values explicitly as parameters is clearer and safer."
            }
          ],
          practice: {
            instructions: "Write a function calculateTax(amount, taxRate) that returns the tax amount, and a second function calculateTotal(amount, taxRate) that calls calculateTax and returns amount plus tax.",
            starterCode: "function calculateTax(amount, taxRate) {\n  // your code\n}\n\nfunction calculateTotal(amount, taxRate) {\n  // your code\n}",
            hint: "calculateTotal should call calculateTax internally rather than repeating its math."
          },
          quiz: [
            {
              question: "What keyword returns a value from a function?",
              options: ["give", "return", "output", "yield"],
              correctIndex: 1,
              explanation: "return exits the function and sends the specified value back to wherever it was called."
            },
            {
              question: "A variable declared with const inside a function is:",
              options: [
                "Accessible everywhere in the file",
                "Only accessible inside that function's scope",
                "Automatically global",
                "Deleted immediately after declaration"
              ],
              correctIndex: 1,
              explanation: "Variables declared inside a function are scoped to that function and are not visible outside it."
            }
          ],
          rememberThis: "A function is a coffee machine: consistent inputs and outputs, hiding the mess inside from everyone who just wants the result.",
          keyTakeaways: [
            "Functions package reusable logic with inputs (parameters) and outputs (return values).",
            "let/const are block-scoped; a variable only exists where it was declared.",
            "Inner functions can access variables from their enclosing scope (closures).",
            "Prefer passing values as parameters over relying on outer-scope variables."
          ]
        },
        {
          title: "Arrays & Objects",
          description: "Grouping related data into ordered lists and labeled collections.",
          estimatedMinutes: 22,
          difficulty: "BEGINNER",
          whatIsIt:
            "An array is an ordered list of values, accessed by numeric index. An object is a collection of key-value pairs, accessed by named property. Together, they're how JavaScript represents structured, real-world data.",
          whyItMatters:
            "Real data is rarely a single value — a shopping cart is a list of products, and each product itself has a name, price, and quantity. Arrays and objects let you model that structure directly in code.",
          analogy:
            "An array is like a numbered row of lockers, where you find things by position (locker #3). An object is like a filing cabinet with labeled folders, where you find things by name (the folder marked \"invoices\") rather than position.",
          simpleExample:
            "A to-do list app might store tasks as an array (\"Buy milk\", \"Walk dog\", \"Pay bills\"), where each individual task could itself be an object with a text field and a completed flag.",
          technicalExplanation:
            "Arrays are created with [] and support methods like .push() (add to end), .map() (transform each item into a new array), .filter() (keep items matching a condition), and .find() (get the first match). Objects are created with {} and store data as key: value pairs, accessed via dot notation (obj.key) or bracket notation (obj[\"key\"]). Arrays of objects are the most common shape for representing lists of real-world records (users, products, tasks).",
          codeExamples: [
            {
              title: "An array of task objects",
              language: "javascript",
              code:
                "const tasks = [\n  { text: \"Buy milk\", completed: false },\n  { text: \"Walk dog\", completed: true },\n];\n\nconst pendingTasks = tasks.filter(task => !task.completed);\nconst taskTexts = tasks.map(task => task.text);\n\nconsole.log(pendingTasks);\nconsole.log(taskTexts);",
              explanation:
                "tasks is an array of objects, each with a text string and a completed boolean. .filter() returns a new array keeping only tasks where completed is false. .map() returns a new array of just the text values, transforming each object into a string."
            }
          ],
          realWorldUsage:
            "API responses are almost always arrays of objects (a list of users, products, or orders), and this exact pattern — array of objects, transformed with map/filter — is the backbone of rendering lists in React.",
          commonMistakes: [
            {
              wrong: "tasks.push(newTask); // mutating the original array directly in React state",
              right: "const updatedTasks = [...tasks, newTask]; // create a new array",
              explanation: "Mutating an array in place (push, splice, sort) can cause bugs in frameworks like React that rely on detecting new references to know when to re-render."
            }
          ],
          practice: {
            instructions: "Create an array of 4 product objects (each with name, price, and inStock). Use .filter() to get only in-stock products, and .map() to get an array of just their names.",
            hint: "Arrow functions make .filter() and .map() callbacks short: item => item.inStock."
          },
          quiz: [
            {
              question: "How do you access a value in an object by its key name?",
              options: ["object[0]", "object.keyName or object[\"keyName\"]", "object->keyName", "object::keyName"],
              correctIndex: 1,
              explanation: "Dot notation (object.keyName) and bracket notation (object[\"keyName\"]) both retrieve a value by its property name."
            },
            {
              question: "What does .map() return?",
              options: [
                "The original array, mutated",
                "A single value",
                "A new array with each item transformed",
                "A boolean"
              ],
              correctIndex: 2,
              explanation: ".map() creates a brand-new array by applying a transformation function to every item in the original."
            }
          ],
          rememberThis: "Arrays are numbered lockers; objects are labeled folders — pick the shape that matches how you'll look things up.",
          keyTakeaways: [
            "Arrays are ordered, indexed lists; objects are key-value collections.",
            "Arrays of objects are the standard shape for real-world data.",
            ".map() transforms, .filter() selects, both returning new arrays.",
            "Avoid mutating arrays/objects directly, especially in frameworks like React."
          ]
        },
        {
          title: "DOM Manipulation & Events",
          description: "Changing what's on the page and reacting to what the user does with JavaScript.",
          estimatedMinutes: 22,
          difficulty: "INTERMEDIATE",
          whatIsIt:
            "The DOM (Document Object Model) is JavaScript's live, in-memory representation of the HTML page, which you can read and change. Events are actions — clicks, key presses, form submissions — that JavaScript can listen for and respond to.",
          whyItMatters:
            "Without DOM manipulation, a webpage would be permanently static once loaded. This is the mechanism that lets JavaScript make pages interactive — showing/hiding content, updating text, responding to clicks.",
          analogy:
            "The DOM is like a live stage set that JavaScript can rearrange while the show is running — moving props, changing the backdrop, or having an actor react the instant an audience member (the user) shouts something out (an event).",
          simpleExample:
            "Clicking a 'Show More' button that reveals hidden text works because JavaScript listens for the click event and then changes an element's style or content in response.",
          technicalExplanation:
            "`document.querySelector(selector)` retrieves an element matching a CSS selector; `.textContent`, `.innerHTML`, and `.style` let you read or change it. `element.addEventListener('event', handlerFunction)` registers a function to run when that event fires (click, submit, keydown, etc.). Modifying the DOM directly like this works but becomes hard to manage at scale — a core motivation for frameworks like React, which manage DOM updates for you.",
          codeExamples: [
            {
              title: "Toggling visibility on button click",
              language: "javascript",
              code:
                "const button = document.querySelector('#toggle-btn');\nconst content = document.querySelector('#details');\n\nbutton.addEventListener('click', () => {\n  const isHidden = content.style.display === 'none';\n  content.style.display = isHidden ? 'block' : 'none';\n});",
              explanation:
                "querySelector finds the button and content elements by their ids. addEventListener registers a click handler as an arrow function. Inside it, we check the content's current display value and flip it between 'block' (visible) and 'none' (hidden) each time the button is clicked."
            }
          ],
          realWorldUsage:
            "Dropdown menus, modals, form validation feedback, image sliders, and 'like' buttons are all built on DOM manipulation and event listeners — even in React apps, this is what happens under the hood after render.",
          commonMistakes: [
            {
              wrong: "document.querySelector('#btn').onclick = handleClick; document.querySelector('#btn').onclick = handleOther; // second overwrites the first",
              right: "document.querySelector('#btn').addEventListener('click', handleClick); ...addEventListener('click', handleOther);",
              explanation: "Assigning .onclick directly only allows one handler at a time and silently overwrites any previous one; addEventListener allows multiple handlers to coexist."
            }
          ],
          practice: {
            instructions: "Build a button that, each time it's clicked, increases a counter displayed in a <span> by 1, starting from 0.",
            starterCode: "<button id=\"increment\">+1</button>\n<span id=\"count\">0</span>\n\n<script>\n  // your code here\n</script>",
            hint: "Keep a JavaScript variable for the count, increment it on click, then update the span's textContent."
          },
          quiz: [
            {
              question: "What does document.querySelector('#myId') return?",
              options: ["A CSS string", "The first element matching the selector, or null if none found", "An array of all matches", "The element's text content"],
              correctIndex: 1,
              explanation: "querySelector returns the first matching element (or null), unlike querySelectorAll which returns all matches."
            },
            {
              question: "Why is addEventListener generally preferred over element.onclick = fn?",
              options: [
                "It's faster to type",
                "It allows multiple handlers on the same event without overwriting each other",
                "onclick doesn't work in modern browsers",
                "There is no difference"
              ],
              correctIndex: 1,
              explanation: "addEventListener lets you attach several independent handlers to the same event, while onclick assignment overwrites any previous handler."
            }
          ],
          rememberThis: "The DOM is the live stage; events are the audience's shouts JavaScript listens for and reacts to.",
          keyTakeaways: [
            "The DOM is JavaScript's live representation of the page.",
            "querySelector/querySelectorAll find elements; properties like textContent and style change them.",
            "addEventListener attaches event handlers without overwriting existing ones.",
            "Direct DOM manipulation is what frameworks like React automate for you."
          ]
        },
        {
          title: "ES6+ Syntax: Arrow Functions, Destructuring & Template Literals",
          description: "Modern, cleaner JavaScript syntax you'll see in almost every real codebase and in React.",
          estimatedMinutes: 20,
          difficulty: "INTERMEDIATE",
          whatIsIt:
            "ES6 (ECMAScript 2015) and later versions added several syntax features that make JavaScript more concise and readable: arrow functions, destructuring (unpacking values from arrays/objects), and template literals (string interpolation).",
          whyItMatters:
            "Virtually all modern JavaScript and React code uses this syntax. Without understanding it, reading real-world code — tutorials, open-source projects, your own team's codebase — becomes needlessly confusing.",
          analogy:
            "Think of these features like shorthand in note-taking: instead of writing out 'the function that takes x and returns x plus one' in full sentences every time, you develop a compact notation that says the same thing faster, once you know how to read it.",
          simpleExample:
            "Instead of building a greeting string by gluing pieces together with +, template literals let you write the whole sentence naturally with a value dropped right into place, like filling in a blank in a sentence.",
          technicalExplanation:
            "Arrow functions (`(a, b) => a + b`) provide shorter syntax than function expressions and don't rebind `this`. Destructuring lets you extract values directly into variables: `const { name, age } = user;` for objects, or `const [first, second] = array;` for arrays. Template literals use backticks and `${expression}` for string interpolation, replacing manual string concatenation with +.",
          codeExamples: [
            {
              title: "Arrow functions, destructuring, and template literals together",
              language: "javascript",
              code:
                "const user = { name: \"Priya\", age: 28 };\nconst { name, age } = user;\n\nconst greet = (name) => `Hello, ${name}! You are ${age} years old.`;\n\nconsole.log(greet(name));",
              explanation:
                "The object destructuring on line 2 pulls name and age directly out of user into their own variables in one line. greet is an arrow function taking a name parameter. The template literal (backticks) embeds name and age directly into the string using ${...}, avoiding messy string concatenation."
            }
          ],
          realWorldUsage:
            "React code destructures props constantly (`function Card({ title, price })`), uses arrow functions for event handlers and callbacks everywhere, and uses template literals for dynamic class names or messages.",
          commonMistakes: [
            {
              wrong: "const greeting = 'Hello, ' + name + '! You are ' + age + ' years old.';",
              right: "const greeting = `Hello, ${name}! You are ${age} years old.`;",
              explanation: "Manual string concatenation with + is error-prone (easy to miss a space or quote) and harder to read than a single template literal."
            }
          ],
          practice: {
            instructions: "Given an object const product = { name: 'Laptop', price: 999 }, destructure name and price into variables, then use a template literal to log 'Laptop costs $999'.",
            hint: "Destructuring syntax: const { name, price } = product;"
          },
          quiz: [
            {
              question: "What does `const { name, age } = user;` do?",
              options: [
                "Creates a new object called user",
                "Extracts the name and age properties of user into their own variables",
                "Deletes name and age from user",
                "Converts user into an array"
              ],
              correctIndex: 1,
              explanation: "This is object destructuring — it unpacks specific properties of an object into standalone variables of the same name."
            },
            {
              question: "Which syntax is used for a template literal?",
              options: ["Single quotes 'text'", "Double quotes \"text\"", "Backticks `text ${value}`", "Square brackets [text]"],
              correctIndex: 2,
              explanation: "Template literals use backticks and allow embedded expressions inside ${...} for string interpolation."
            }
          ],
          rememberThis: "Arrow functions, destructuring, and template literals are the shorthand of modern JavaScript — fluency here makes every React codebase readable.",
          keyTakeaways: [
            "Arrow functions offer concise syntax and don't rebind this.",
            "Destructuring extracts values from objects/arrays into variables directly.",
            "Template literals (backticks) allow clean string interpolation with ${}.",
            "This syntax is everywhere in modern JavaScript and React code."
          ]
        },
        {
          title: "Async JavaScript & fetch()",
          description: "Handling operations that take time — like network requests — without freezing the page.",
          estimatedMinutes: 25,
          difficulty: "INTERMEDIATE",
          whatIsIt:
            "Asynchronous JavaScript lets code start a slow operation (like fetching data from a server) and continue running other code while waiting, instead of freezing until it finishes. `fetch()` is the built-in browser function for making HTTP requests from JavaScript.",
          whyItMatters:
            "Network requests can take anywhere from milliseconds to several seconds. If JavaScript waited (blocked) during that time, the entire page would freeze — buttons wouldn't respond, animations would stop. Async code keeps the page responsive.",
          analogy:
            "It's like ordering food at a restaurant and getting a buzzer instead of standing frozen at the counter: you go sit down and do other things, and the buzzer (a callback/promise resolving) alerts you the moment your order is ready.",
          simpleExample:
            "A weather app button that says 'Loading...' while it asks a weather API for today's forecast, then updates to show the temperature once the response arrives, is asynchronous behavior in action.",
          technicalExplanation:
            "A Promise represents a value that will be available now, later, or never (if it fails). `fetch(url)` returns a Promise that resolves to a Response object once the request completes; calling `.json()` on it returns another Promise resolving to the parsed data. The `async`/`await` syntax lets you write asynchronous code that reads top-to-bottom like synchronous code, and `try/catch` handles errors from a failed request or a rejected Promise.",
          codeExamples: [
            {
              title: "Fetching data with async/await and error handling",
              language: "javascript",
              code:
                "async function getWeather(city) {\n  try {\n    const response = await fetch(`https://api.example.com/weather?city=${city}`);\n    if (!response.ok) throw new Error('Request failed');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Could not fetch weather:', error.message);\n    return null;\n  }\n}",
              explanation:
                "The async keyword lets us use await inside this function. await fetch(...) pauses this function (without freezing the page) until the network response arrives. We check response.ok to catch HTTP-level errors like 404s. await response.json() parses the response body. Any failure — network error or thrown error — is caught by the catch block instead of crashing the app."
            }
          ],
          realWorldUsage:
            "Every app that loads data from a backend — a social feed, a product catalog, a weather widget, a dashboard — uses fetch() or a wrapper library like axios with async/await to load that data without freezing the UI.",
          commonMistakes: [
            {
              wrong: "const data = fetch(url).json(); console.log(data); // data is a pending Promise, not the actual result",
              right: "const response = await fetch(url); const data = await response.json();",
              explanation: "fetch() and .json() both return Promises, not immediate values — forgetting await means you're working with an unresolved Promise object instead of the actual data."
            }
          ],
          practice: {
            instructions: "Write an async function getUser(id) that fetches from `https://jsonplaceholder.typicode.com/users/${id}`, handles a failed request gracefully, and logs the user's name from the parsed JSON.",
            hint: "Remember: await fetch() gives you a Response; you still need a second await on response.json() to get usable data."
          },
          quiz: [
            {
              question: "What does fetch() return?",
              options: ["The parsed JSON data immediately", "A Promise that resolves to a Response object", "A string", "Nothing, it's a void function"],
              correctIndex: 1,
              explanation: "fetch() returns a Promise resolving to a Response object; you still need to call .json() (also async) to extract usable data."
            },
            {
              question: "Why use try/catch with async/await for a fetch call?",
              options: [
                "It's required syntax with no functional purpose",
                "To handle network failures or thrown errors gracefully instead of crashing",
                "It makes the request faster",
                "To avoid using await"
              ],
              correctIndex: 1,
              explanation: "Network requests can fail for many reasons; try/catch lets you handle those failures gracefully instead of letting an unhandled rejection crash your logic."
            }
          ],
          rememberThis: "Async code is a restaurant buzzer, not a frozen line: start the request, keep moving, and react the moment the answer arrives.",
          keyTakeaways: [
            "Asynchronous code prevents slow operations from freezing the page.",
            "fetch() returns a Promise; response.json() returns another Promise.",
            "async/await lets asynchronous code read like synchronous code.",
            "Always handle failures with try/catch when working with await."
          ]
        }
      ]
    },
    {
      name: "Git & GitHub",
      description: "Tracking changes to your code over time and collaborating with other developers.",
      estimatedDuration: "4 days",
      lessons: [
        {
          title: "Git Fundamentals",
          description: "What version control is and how Git tracks changes to your project over time.",
          estimatedMinutes: 15,
          difficulty: "BEGINNER",
          whatIsIt:
            "Git is a version control system: software that records snapshots of your project's files over time, so you can see history, undo mistakes, and work on changes without fear of losing previous work.",
          whyItMatters:
            "Without version control, developers would rename files like 'project_final_v3_REAL.zip' to track changes, with no reliable way to see what changed, when, or why, or to safely undo a bad change.",
          analogy:
            "Git is like a video game's save system: you can save your progress (commit) at meaningful points, and if something goes wrong later, you can load an earlier save instead of starting the entire game over.",
          simpleExample:
            "After finishing a working login page, you'd 'commit' that snapshot. If you later break something while adding a new feature, you can look back at that earlier commit to see exactly what changed.",
          technicalExplanation:
            "A Git repository (repo) is a project folder tracked by Git, initialized with `git init`. Git tracks three areas: the working directory (your actual files), the staging area (changes marked ready to be saved via `git add`), and the repository history (permanent snapshots saved via `git commit`). `git status` shows the current state of all three.",
          codeExamples: [
            {
              title: "Initializing a repo and checking status",
              language: "bash",
              code: "git init\ngit status",
              explanation:
                "git init creates a new, empty Git repository in the current folder (a hidden .git directory). git status then shows which files are tracked, untracked, or modified — the first command you should run whenever you're unsure of a repo's current state."
            }
          ],
          realWorldUsage:
            "Every professional software team uses Git (or something built on it) to track every single code change, making it possible to know exactly who changed what, when, and why, across the life of a project.",
          commonMistakes: [
            {
              wrong: "Working for weeks without committing, then trying to commit one giant, unreviewable change.",
              right: "Commit small, logical chunks of work often, each with a clear message.",
              explanation: "Frequent, small commits make history readable and mistakes easy to isolate and undo; one giant commit hides what actually changed."
            }
          ],
          practice: {
            instructions: "Initialize a Git repository in a new folder, create a file called notes.txt with any text, and run git status to see it listed as untracked.",
            hint: "Untracked means Git sees the file exists but isn't yet tracking its changes."
          },
          quiz: [
            {
              question: "What does git init do?",
              options: ["Uploads code to GitHub", "Creates a new local Git repository", "Deletes all files", "Creates a new branch"],
              correctIndex: 1,
              explanation: "git init sets up Git's tracking for the current folder, creating the hidden .git directory that stores all history."
            },
            {
              question: "What does git status show?",
              options: ["The commit history", "The current state of tracked/untracked/modified files", "The remote URL", "The list of branches only"],
              correctIndex: 1,
              explanation: "git status gives a snapshot of what's changed, staged, or untracked in your working directory right now."
            }
          ],
          rememberThis: "Git is a save system for your code: commit often, and you'll never truly lose meaningful progress.",
          keyTakeaways: [
            "Git is a version control system that tracks project history over time.",
            "Repos have three areas: working directory, staging area, and committed history.",
            "git init starts tracking a folder; git status shows its current state.",
            "Frequent, small commits are far better than rare, giant ones."
          ]
        },
        {
          title: "Commits & Branching",
          description: "Saving meaningful snapshots and working on separate lines of development.",
          estimatedMinutes: 20,
          difficulty: "BEGINNER",
          whatIsIt:
            "A commit is a saved snapshot of your project at a point in time, with a message describing what changed. A branch is an independent line of development, letting you work on a feature without affecting the main, stable version of the code.",
          whyItMatters:
            "Without branches, every change — even risky, half-finished experiments — would happen directly on the same codebase everyone relies on. Branches let developers work in isolation and merge in only once their work is ready.",
          analogy:
            "Branching is like working on a draft copy of a document while the original stays untouched on the shelf — you can experiment freely on your copy, and only replace the original once your draft is actually better.",
          simpleExample:
            "While the main version of a website is live and stable, a developer creates a new branch called 'add-dark-mode' to build that feature separately, without risking breaking the live site while it's unfinished.",
          technicalExplanation:
            "`git add <file>` stages changes, and `git commit -m \"message\"` saves a snapshot of staged changes with a descriptive message. `git branch <name>` creates a new branch, and `git checkout -b <name>` (or `git switch -c <name>`) creates and switches to it in one step. `git log` shows commit history, and each commit has a unique hash identifying it.",
          codeExamples: [
            {
              title: "Staging, committing, and branching",
              language: "bash",
              code:
                "git add login.js\ngit commit -m \"Add basic login form validation\"\n\ngit checkout -b add-dark-mode\n# ...make changes...\ngit add styles.css\ngit commit -m \"Add dark mode toggle styles\"",
              explanation:
                "git add stages login.js for the next commit; git commit saves that staged snapshot with a clear message. git checkout -b creates and switches to a new branch called add-dark-mode, where subsequent commits happen independently of the main branch until merged back."
            }
          ],
          realWorldUsage:
            "Every feature, bug fix, or experiment on a real engineering team typically happens on its own branch, keeping the main branch always stable and deployable.",
          commonMistakes: [
            {
              wrong: "git commit -m \"stuff\" or \"fix\"",
              right: "git commit -m \"Fix null pointer error on empty cart checkout\"",
              explanation: "Vague commit messages give future readers (including yourself) no useful information when scanning history to find when or why something changed."
            }
          ],
          practice: {
            instructions: "Create a new branch called practice-feature, make a change to a file, commit it with a clear message, then switch back to the main branch and confirm your change isn't there.",
            hint: "Use git checkout main (or master) to switch back, and git log --oneline to see commit history compactly."
          },
          quiz: [
            {
              question: "What does a commit represent?",
              options: ["A branch name", "A saved snapshot of changes with a message", "A remote server", "A merge conflict"],
              correctIndex: 1,
              explanation: "A commit permanently records the staged changes at that moment, along with a message explaining what and why."
            },
            {
              question: "Why use a separate branch for a new feature?",
              options: [
                "It's required by Git and cannot be skipped",
                "To develop without affecting the stable main branch until ready",
                "It makes commits faster",
                "Branches are only for bug fixes"
              ],
              correctIndex: 1,
              explanation: "Branches isolate in-progress or experimental work so the main branch stays stable and deployable at all times."
            }
          ],
          rememberThis: "A branch is your private draft — experiment freely, and only merge back once it's actually ready.",
          keyTakeaways: [
            "git add stages changes; git commit saves them with a message.",
            "Branches let you develop features in isolation from the main codebase.",
            "Write clear, descriptive commit messages — future you will thank you.",
            "git log shows the project's commit history."
          ]
        },
        {
          title: "Merging & Resolving Conflicts",
          description: "Bringing branches back together, and handling the moments Git can't decide for you.",
          estimatedMinutes: 20,
          difficulty: "INTERMEDIATE",
          whatIsIt:
            "Merging combines the changes from one branch into another. A merge conflict happens when Git can't automatically decide how to combine two changes — typically because both branches edited the same lines of the same file differently.",
          whyItMatters:
            "Once a feature branch is finished, its work needs to rejoin the main codebase. Conflicts are a normal part of that process when multiple people (or you, across branches) touch the same code — knowing how to resolve them calmly is an essential real-world skill.",
          analogy:
            "It's like two people editing the same paragraph of a shared document, one changing a sentence to blue and the other to green — the document can't guess which color you actually wanted, so a human has to step in and decide.",
          simpleExample:
            "If your dark-mode branch and a teammate's typo-fix branch both changed the same line of the same CSS file, merging them will pause and ask you to manually choose (or combine) the final version of that line.",
          technicalExplanation:
            "`git merge <branch>` (run while on the target branch, e.g. main) integrates another branch's commits. If changes don't overlap, Git merges automatically. If they do, Git marks the file with conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) showing both versions, and you must manually edit the file to the correct final content, then `git add` the resolved file and `git commit` to complete the merge.",
          codeExamples: [
            {
              title: "A conflict marker and its resolution",
              language: "text",
              code:
                "<<<<<<< HEAD\ncolor: blue;\n=======\ncolor: green;\n>>>>>>> add-dark-mode\n\n/* After manually resolving: */\ncolor: green;",
              explanation:
                "Everything between <<<<<<< HEAD and ======= is the current branch's version; everything between ======= and >>>>>>> add-dark-mode is the incoming branch's version. You delete the markers and keep, combine, or rewrite the content to what it should actually be — here, choosing green — before committing."
            }
          ],
          realWorldUsage:
            "On any team of more than one developer, merge conflicts happen regularly and are considered completely normal — resolving them calmly and correctly is a routine, expected part of professional collaboration.",
          commonMistakes: [
            {
              wrong: "Panicking and running git merge --abort repeatedly instead of reading what actually conflicts.",
              right: "Open the conflicted file, read both versions carefully, and manually decide the correct combined result before committing.",
              explanation: "Conflicts are just Git asking a question it can't answer alone; reading the marked sections tells you exactly what decision needs to be made."
            }
          ],
          practice: {
            instructions: "Create two branches from main that both edit the same line of the same file differently. Merge one into main, then attempt to merge the second and resolve the resulting conflict manually.",
            hint: "After editing out the conflict markers, don't forget to git add the file and git commit to finish the merge."
          },
          quiz: [
            {
              question: "When does a merge conflict occur?",
              options: [
                "Every time you merge two branches",
                "When two branches change the same lines differently and Git can't auto-resolve it",
                "Only when using GitHub, never locally",
                "When you delete a branch"
              ],
              correctIndex: 1,
              explanation: "Conflicts arise specifically when overlapping changes can't be automatically reconciled — non-overlapping changes merge cleanly on their own."
            },
            {
              question: "What must you do after manually resolving conflict markers in a file?",
              options: [
                "Nothing further is needed",
                "git add the file and git commit to complete the merge",
                "Delete the branch",
                "Restart Git entirely"
              ],
              correctIndex: 1,
              explanation: "Resolving the markers only fixes the file's content — you still need to stage and commit to tell Git the merge is complete."
            }
          ],
          rememberThis: "A merge conflict isn't Git failing — it's Git correctly refusing to guess what you meant.",
          keyTakeaways: [
            "Merging integrates one branch's commits into another.",
            "Conflicts occur when overlapping changes can't be auto-resolved.",
            "Conflict markers show both versions; you manually choose the correct result.",
            "Always git add and git commit after resolving a conflict."
          ]
        },
        {
          title: "GitHub & Pull Requests",
          description: "Hosting your repository remotely and proposing changes through pull requests.",
          estimatedMinutes: 18,
          difficulty: "INTERMEDIATE",
          whatIsIt:
            "GitHub is a cloud platform for hosting Git repositories online, enabling backup, sharing, and collaboration. A pull request (PR) is a formal proposal to merge changes from one branch into another, opened for discussion and review before merging.",
          whyItMatters:
            "Git alone works locally on your machine; GitHub adds a shared, remote copy that teams push to and pull from, plus tools like pull requests, issues, and code review that make collaborative software development possible at scale.",
          analogy:
            "If Git is your personal notebook, GitHub is a shared library where everyone's notebooks live centrally. A pull request is like submitting a chapter you wrote for the librarian and other authors to review and comment on before it's added to the official book.",
          simpleExample:
            "A developer finishes a new feature on their branch, pushes it to GitHub, and opens a pull request titled 'Add password reset flow' so a teammate can review the code and leave comments before it becomes part of the main project.",
          technicalExplanation:
            "`git remote add origin <url>` links a local repo to a GitHub repo. `git push origin <branch>` uploads local commits to GitHub; `git pull` downloads and merges remote changes into your local branch. A pull request is opened on GitHub's website comparing a feature branch to a base branch (often main), allowing reviewers to comment, request changes, run automated checks (CI), and ultimately approve and merge it.",
          codeExamples: [
            {
              title: "Pushing a branch and preparing for a PR",
              language: "bash",
              code:
                "git remote add origin https://github.com/username/project.git\ngit push -u origin add-dark-mode",
              explanation:
                "git remote add origin links this local repo to a GitHub repository URL, naming it origin by convention. git push -u origin add-dark-mode uploads the add-dark-mode branch to GitHub and sets it to track that remote branch, after which you can open a pull request from it on GitHub's website."
            }
          ],
          realWorldUsage:
            "Virtually every professional software team uses GitHub (or a similar platform like GitLab) with pull requests as the standard workflow for reviewing and merging code before it reaches production.",
          commonMistakes: [
            {
              wrong: "Pushing directly to main and merging your own work without any review.",
              right: "Push to a feature branch, open a pull request, and get at least one review before merging into main.",
              explanation: "Skipping review removes a critical safety net that catches bugs, design issues, and knowledge-sharing opportunities before code reaches everyone else."
            }
          ],
          practice: {
            instructions: "Create a GitHub repository, push a local project to it, create a feature branch with a small change, push that branch, and open a pull request comparing it to main.",
            hint: "GitHub shows a 'Compare & pull request' button automatically after you push a new branch."
          },
          quiz: [
            {
              question: "What is the primary purpose of a pull request?",
              options: [
                "To delete a branch",
                "To propose and review changes before merging them into another branch",
                "To download someone else's repository",
                "To rename a repository"
              ],
              correctIndex: 1,
              explanation: "A pull request opens proposed changes up for discussion, review, and approval before they become part of the target branch."
            },
            {
              question: "What does git push do?",
              options: [
                "Downloads changes from GitHub",
                "Uploads local commits to a remote repository",
                "Deletes local commits",
                "Creates a new local branch"
              ],
              correctIndex: 1,
              explanation: "git push sends your local commits on a branch up to the corresponding remote repository, like GitHub."
            }
          ],
          rememberThis: "GitHub is the shared library; a pull request is how you formally propose adding your chapter to the book.",
          keyTakeaways: [
            "GitHub hosts Git repositories remotely for backup and collaboration.",
            "git push uploads commits; git pull downloads and merges them.",
            "A pull request proposes merging one branch into another, with review.",
            "Code review via pull requests is standard practice on real teams."
          ]
        },
        {
          title: "Collaboration Basics",
          description: "Working smoothly on the same codebase as other developers without stepping on each other's work.",
          estimatedMinutes: 15,
          difficulty: "INTERMEDIATE",
          whatIsIt:
            "Collaboration basics cover the habits and conventions that let multiple developers work on the same project without constant conflicts: pulling before pushing, writing clear PR descriptions, using .gitignore, and following a consistent branching strategy.",
          whyItMatters:
            "Technical Git commands alone don't prevent team friction — most real-world collaboration problems come from unclear communication, stale branches, or accidentally committing files that shouldn't be tracked.",
          analogy:
            "It's like several cooks sharing one kitchen: even if everyone knows how to use the stove (Git commands), things only run smoothly if they communicate who's using what, clean up after themselves, and check in before touching shared equipment.",
          simpleExample:
            "Before starting new work each morning, a developer runs `git pull` on main to make sure they're building on top of the latest code, avoiding painful conflicts later from working on a stale, outdated copy.",
          technicalExplanation:
            "A `.gitignore` file lists files/folders (like `node_modules/` or `.env`) that Git should never track, keeping secrets and generated files out of the repository. Common conventions include pulling the latest main before branching, keeping branches small and focused, writing descriptive PR titles/descriptions, and responding promptly to review comments. Naming conventions like `feature/add-login` or `fix/cart-total-bug` also help teams scan branch lists at a glance.",
          codeExamples: [
            {
              title: "A typical .gitignore for a JavaScript project",
              language: "text",
              code: "node_modules/\n.env\ndist/\n.DS_Store",
              explanation:
                "node_modules/ is excluded because it's huge and regenerable from package.json. .env is excluded because it often holds secrets like API keys. dist/ is a build output that can be regenerated, not source code. .DS_Store is a macOS system file with no project relevance."
            }
          ],
          realWorldUsage:
            "Every real repository has a .gitignore file, and every functioning team has agreed-upon conventions for branching and PRs — onboarding to a new job usually includes learning that team's specific Git workflow.",
          commonMistakes: [
            {
              wrong: "Accidentally committing a .env file containing API keys and database passwords.",
              right: "Add .env to .gitignore before ever running git add, and use environment-specific config for secrets.",
              explanation: "Once a secret is committed, it exists in Git history forever (even if deleted later) unless the history itself is rewritten — prevention via .gitignore is far easier than cleanup."
            }
          ],
          practice: {
            instructions: "Create a .gitignore file for a Node.js project that excludes node_modules, .env, and any build output folder. Verify with git status that those paths no longer show as untracked.",
            hint: "A .gitignore only affects untracked files — if a file is already committed, you'll also need to remove it from tracking separately."
          },
          quiz: [
            {
              question: "What is the purpose of a .gitignore file?",
              options: [
                "To delete files from your computer",
                "To list files/folders Git should never track",
                "To merge branches automatically",
                "To create a backup of the repo"
              ],
              correctIndex: 1,
              explanation: ".gitignore tells Git which files or folders to exclude from tracking and commits, like secrets or generated build files."
            },
            {
              question: "Why pull the latest main before starting new work?",
              options: [
                "It's not necessary",
                "To avoid building on outdated code and reduce future merge conflicts",
                "It deletes your local branches",
                "It automatically writes your commit messages"
              ],
              correctIndex: 1,
              explanation: "Starting from the latest main reduces the chance of large, painful conflicts later when your branch is finally merged back."
            }
          ],
          rememberThis: "Good Git collaboration is a shared kitchen: communicate, clean up after yourself, and never leave secrets on the counter.",
          keyTakeaways: [
            ".gitignore keeps secrets and generated files out of version control.",
            "Pull the latest main before starting new branches to avoid conflicts.",
            "Small, focused branches and clear PR descriptions make review easier.",
            "Every team has its own conventions — learn and follow them."
          ]
        }
      ]
    }
  ]
};
