function editorTextarea(cfg) {
    var textarea = jQuery("#tuieditor_instance_" + cfg.editor_sequence);
    var content_key = textarea.data("editor-content-key-name");
    var primary_key = textarea.data("editor-primary-key-name");
    var insert_form = textarea.closest("form");
    var content_input = insert_form.find("input[name='" + content_key + "']");

    // Set editor keys
    editorRelKeys[cfg.editor_sequence] = {};
    editorRelKeys[cfg.editor_sequence].primary = insert_form.find("input[name='" + primary_key + "']");
	editorRelKeys[cfg.editor_sequence].content = content_input;
    editorRelKeys[cfg.editor_sequence].func = editorGetContent;

    insert_form[0].setAttribute('editor_sequence', cfg.editor_sequence);
    
    // Set default language
    if (!cfg.editor_language) {
        cfg.editor_language = 'en_US';
    }

    var editor = tui.Editor.factory({
    	el: document.getElementById('tuieditor_instance_' + cfg.editor_sequence),
        initialEditType: 'markdown',
        previewStyle: cfg.editor_previewStyle,
        minHeight: cfg.editor_height,
        height: 'auto',
        language: cfg.editor_language
    });

    // Set initial content
    if(content_input.val()){
        editor.setHtml(content_input.val());
    }
    
    // Save edited content
	insert_form.on("submit", function() {
		content_input.val(editor.getHtml());
	});
}

