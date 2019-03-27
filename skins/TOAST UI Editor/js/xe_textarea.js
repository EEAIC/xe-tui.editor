function editorTextarea(cfg) {
    var seq = cfg.editor_sequence;

    var textarea = jQuery("#tuieditor_instance_" + seq);
    var content_key = textarea.data("editor-content-key-name");
    var primary_key = textarea.data("editor-primary-key-name");
    var insert_form = textarea.closest("form");
    var content_input = insert_form.find("input[name='" + content_key + "']");

    // Set editor keys    
    editorRelKeys[seq] = {};
    editorRelKeys[seq].primary = insert_form.find("input[name='" + primary_key + "']");
	editorRelKeys[seq].content = content_input;
    editorRelKeys[seq].cfg = cfg;
  
    insert_form[0].setAttribute('editor_sequence', seq);
    
    // Set default language
    if (!editorRelKeys[seq].cfg.editor_language) {
        editorRelKeys[seq].cfg.editor_language = 'en_US';
    }

    var editorParam = {
        el: document.getElementById('tuieditor_instance_' + seq),
        initialEditType: 'markdown',
        previewStyle: cfg.editor_previewStyle,
        minHeight: cfg.editor_height,
        height: 'auto',
        language: editorRelKeys[seq].cfg.editor_language,
        exts: ['chart', 'uml', 'table', 'youtube']
    }

    if (editorRelKeys[seq].cfg.allow_fileupload) {
        editorParam.hooks = {            
            'addImageBlobHook': function(blob, callback) {
                var fd = new FormData();
                fd.append('Filedata', blob);
                fd.append('editor_sequence', seq);
                fd.append('upload_target_srl', editorRelKeys[seq].cfg.upload_target_srl);
                fd.append('file_list_area_id', editorRelKeys[seq].cfg.fileListAreaID )
                fd.append('mid', current_mid);

                var request = {
                    send: request_uri
                        .setQuery('module', 'file')
                        .setQuery('act', 'procFileUpload'),
                }

                $.ajax({
                    type: "POST",
                    url : request.send,
                    dataType: 'json',
                    data : fd,
                    processData  : false,
                    contentType : false,
                    success: function(evt) {                                                                              
                        uploader.fire('success', evt);                          
                        callback(evt.download_url);
                    },
                    error: function() {
                        alert("failure");
                    }
                })
            }
        }
    }

    var editor = tui.Editor.factory(editorParam);

    // Set initial content
    if(content_input.val()){
        editor.setValue(content_input.val());
    }
    
    // Save edited content
	insert_form.on("submit", function() {
        content_input.val(editor.getMarkdown());
        if (arr_file_srl[seq]) {
            var params = {
                file_srls       : arr_file_srl[seq].join(','),
                editor_sequence : seq
            }

            // Requset file delete
            exec_xml("file","procFileDelete", params);
        }
    });
}

