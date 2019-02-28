function editorTextarea(editor_sequence, editor_height, editor_previewStyle, editor_language = 'en_US') {
    var textarea = jQuery("#tuieditor_instance_" + editor_sequence);
    var content_key = textarea.data("editor-content-key-name");
    var primary_key = textarea.data("editor-primary-key-name");
    var insert_form = textarea.closest("form");
    var content_input = insert_form.find("input[name='" + content_key + "']");
    

    // Set editor keys
    editorRelKeys[editor_sequence] = {};
    editorRelKeys[editor_sequence].primary = insert_form.find("input[name='" + primary_key + "']");
	editorRelKeys[editor_sequence].content = content_input;
    editorRelKeys[editor_sequence].func = editorGetContent;

    insert_form[0].setAttribute('editor_sequence', editor_sequence);
    
    var editor = tui.Editor.factory({
    	el: document.getElementById('tuieditor_instance_' + editor_sequence),
        initialEditType: 'markdown',
        previewStyle: editor_previewStyle,
        minHeight: editor_height,
        height: 'auto',
        language: editor_language
       
    });
  
    editor.setHtml(content_input.val());
    
    // Save edited content
	insert_form.on("submit", function() {
		content_input.val(editor.getHtml());
	});
}

