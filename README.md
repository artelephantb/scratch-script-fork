<img src="./files/images/logo.png" width="600px"/>

A text based language with JavaScript like syntax that compiles to Scratch

<h2>Syntax Guide</h2>
<ul>
	<li><a href="#basic-syntax">Basic syntax</a></li>
	<li><a href="#scripts">Scripts</a></li>
	<li><a href="#control-flow">Control flow</a></li>
	<li><a href="#variables-and-lists">Variables and Lists</a></li>
	<li><a href="#sprites">Sprites</a></li>
</ul>
<h3 id="basic-syntax">Basic syntax</h3>
<ul>
	<li>ScratchScript's syntax is pretty similar to JavaScript syntax. If you know javascript syntax, you'll probably be able to catch on pretty quickly. Note that ScratchScript doesn't have the same keywords that JavaScript does. There are no <code>break</code>, <code>let</code>, <code>await</code> etc.</li>
	<li>Indentation is optional</li>
	<li>Functions always use parentheses</li>
	<li>You can have a space after the function name before the parentheses</li>
	<li>Strings are always surrounded by double quotes <code>"</code></li>
	<li>Numbers do not need to be surrounded by quotes</li>
	<li>Everything is a function and needs parentheses, including blocks like <code>xPos()</code> or <code>size()</code></li>
	<li>The exception to the rule above are <a href="#variables-and-lists">variables and lists</a></li>
	<li>There isn't much error handling, so don't mess stuff up</li>
	<li>Note: Just because a project runs in the editor preview doesn't mean it will load into Scratch if you're using invalid syntax in your code.</li>
	<li>Note: To have the preview have updated code, you must recompile with the big green button. Just pressing the green flag doesn't recompile.</li>
	<li>To do comments, put <code>//</code> at the begining of the line</li>
	<br>
	<span>Example script:</span>
<pre><code>whenGreenFlagClicked()
setVar("correct?", 0)
repeatUntil (=($correct?, 1)) {
ask("What is 1 + 1?")
if (=(answer(), 2)) {
	sayForSecs("You got it right!", 2)
	setVar("correct?", 1)
} else {
	sayForSecs("You got it wrong...", 2)
}
}
moveSteps(10)
</code></pre>
</ul>
<h3 id="scripts">Scripts</h3>
<ul>
	<p>Scripts are sections of code begining with a hat block. For example, the <code>whenGreenFlagClicked()</code> block is a hat block.</p>
	<p>To seperate scripts, use a blank line. For example: </p>
<pre><code>whenGreenFlagClicked()
moveSteps(10)

whenKeyPressed("space")
sayForSecs("You pressed space!", 2)
</code></pre>
</ul>
<h3 id="control-flow">Control Flow</h3>
<ul>
	For the blocks <code>repeat</code>, <code>repeatUntil</code>, <code>while</code>, <code>if</code>, and <code>forever</code> use curly braces <code>{}</code>
	<p>For example, to make a loop that repeats until the mouse is down, you would do:</p>
	
<pre><code>repeatUntil (mouseDown()) {
[more stuff here]
}</code></pre>
	<p>To do an else for an if, just add <code>} else {</code></p>
<pre><code>if (condition) {
[code]
} else {
[more code]
}</code></pre>
</ul>
<h3 id="variables-and-lists">Variables and Lists</h3>
<ul>
	<p>Variables and lists are created as you use them.</p>
	<p>For example, to create and set a variable to the users input, you would do:</p>
<pre><code>ask("what")
setVar("mycoolvar", answer())
</code></pre>
	<p>For a list, creating and adding a item to a list would be:</p>
<pre><code>addToList("myitem", "mycoolist")</code></pre>
	<p>The same applies for the other list and variable functions</p>
	<p>To reference a variable or list, you would do <code>$varname</code> for variables or <code>#listname</code> for lists</p>
	<p>Note: "reference" in this case means when reading out the value to use in another block. For blocks that change/edit the value, use a string quoted name as an argument</p>
</ul>
<h3 id="sprites">Sprites</h3>
<ul>
	<p>You can add sprites by clicking the "New Sprite" button</p>
</ul>
<br>
<p>I think that's it</p>

<h1>Notice</h1>
<p>The code editor (CodeMirror) is under the MIT liscense (see <a href="https://github.com/codemirror/dev/blob/main/LICENSE">https://github.com/codemirror/dev/blob/main/LICENSE</a>). The block renderer (scratchblocks) is under the MIT liscense (see <a href="https://github.com/scratchblocks/scratchblocks/blob/main/LICENSE">https://github.com/scratchblocks/scratchblocks/blob/main/LICENSE</a>). Scratch Script is in no way affiliated nor endorsed by scratchblocks, Scratch, the Scratch Foundation, or the Scratch Team. Scratch is developed by the Lifelong Kindergarten Group at the MIT Media Lab. See the <a href="https://scratch.mit.edu">Scratch Website.</a></p>
