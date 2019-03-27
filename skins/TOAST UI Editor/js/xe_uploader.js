(function($){
    function init(cfg) {
        $(function(){ editorFileUploader(cfg); });
    }

    function editorFileUploader(cfg) {
        var seq = cfg.editor_sequence;
        var request = {
            send: request_uri
                .setQuery('module', 'file')
                .setQuery('act', 'procFileUpload'),
        }

        // create FileUploader
        uploader = new tui.FileUploader($('#uploader'), {
            url: {
                send: request.send,
                remove: request.send
            },
            isMultiple: false,
            listUI: {
                type: editorRelKeys[seq].cfg.fileUploadView
            }
        });

        var $uploadedCount = $('#uploadedCount');
        var $itemTotalSize = $('#itemTotalSize');
        var $checkedItemCount = $('#checkedItemCount');
        var $checkedItemSize = $('#checkedItemSize');
        var $removeButton = $('.tui-btn-cancel');
                       
        arr_file_srl = [];
        arr_file_srl[seq] = new Array(); // will be removed File list
        
        disableRemoveButton(1);
        // check attached files
        loadFileList();

        // below service code
        function disableRemoveButton(state) {
            var className = 'tui-is-disabled';

            if (state) {
                $removeButton.addClass(className);
            } else {
                $removeButton.removeClass(className);
            }

            $removeButton.prop('disabled', state);
        }

        function updateCheckedInfo(size, count) {
            $checkedItemSize.html(size);
            $checkedItemCount.html(count);
        }
 
        function resetInfo() {
            $itemTotalSize.html('0 KB');
            $checkedItemSize.html('0 KB');
            $checkedItemCount.html('0');
        }

        uploader.on('update', function(evt) { // This event is only fired when using batch transfer
            var items = evt.filelist;
            var totalSize = uploader.getTotalSize(items);
            $itemTotalSize.html(totalSize);
        });

        uploader.on('check', function(evt) {
            var checkedItems = uploader.getCheckedList();
            var checkedItemSize = uploader.getTotalSize(checkedItems);
            var checkedItemCount = checkedItems.length;
            var removeButtonState = (checkedItemCount === 0);
            disableRemoveButton(removeButtonState);
            updateCheckedInfo(checkedItemSize, checkedItemCount);
        });

        uploader.on('checkAll', function(evt) {
            var checkedItems = uploader.getCheckedList();
            var checkedItemSize = uploader.getTotalSize(checkedItems);
            var checkedItemCount = checkedItems.length;
            var removeButtonState = (checkedItemCount === 0);
            disableRemoveButton(removeButtonState);
            updateCheckedInfo(checkedItemSize, checkedItemCount);
        });

        uploader.on('remove', function(evt) {
            var checkedItems = uploader.getCheckedList();
            var removeButtonState = (checkedItems.length === 0);
            disableRemoveButton(removeButtonState);
            // setUploadedCountInfo(0);
            resetInfo();
        });

        uploader.on('success', function(evt) {
            // 새글 작성인 경우 upload_target_srl 을 input 값에 추가
            if (!editorRelKeys[seq].primary.val()) {
                editorRelKeys[seq].primary.val(evt.upload_target_srl);
            }
            
            // var successCount = evt.success;
            // var removeButtonState = (successCount > 0);

            // $uploadedCount.html(successCount);
            // disableRemoveButton(removeButtonState);
            // setUploadedCountInfo(successCount);
            reloadFileList();
        });

        // remove file in simple style
        uploader.on('delete', function(evt) {

           
            arr_file_srl[seq].push(evt.idList[0]);
            // exec_xml("file","procFileDelete", param, function() { });
            reloadFileList(); 
        });


        // remove file in table style
        $removeButton.on('click', function() {
            var checkedItems = uploader.getCheckedList();
            // uploader.removeList(checkedItems);

            
            for (var i = 0; i < checkedItems.length; i++) {
                arr_file_srl[seq].push(checkedItems[i].id);
            }

            reloadFileList();
        });

        function reloadFileList() {            
            uploader.clear();
            loadFileList();
        }

        function loadFileList() {
            var params = {
                mid : current_mid,
                file_list_area_id : editorRelKeys[seq].cfg.fileListAreaID,
                editor_sequence   : seq,
                upload_target_srl : editorRelKeys[seq].cfg.upload_target_srl
            };

            function on_complete(ret, response_tags) {
                var files_data =  ret.files.item;               
                console.log(files_data);
                if (files_data) {                    
                    if (Array.isArray(files_data)){ // remove multiple file 
                        for (var i = 0; i < files_data.length; i++) {
                            files_data[i].name = files_data[i].source_filename;
                            files_data[i].size = files_data[i].file_size;
                            files_data[i].id = files_data[i].file_srl;
                        }                       
                        files_data = files_data.filter(item => !(arr_file_srl[seq].includes(item.id)));               
                    } else {
                        if (!(arr_file_srl[seq].includes(files_data.file_srl))) {                                                    
                            files_data.name = files_data.source_filename;
                            files_data.size = files_data.file_size;
                            files_data.id = files_data.file_srl;
                        } else {
                            files_data = [];
                        }
                    }
                    uploader.updateList(files_data);
                }

                var checkedItems = uploader.getCheckedList();
                var removeButtonState = (checkedItems.length === 0);
                disableRemoveButton(removeButtonState);
            }

            exec_xml(
                'file',         // module
                'getFileList',  // act
                params,         // parameters
                on_complete,    // callback
                'error,message,files,upload_status,upload_target_srl,editor_sequence,left_size'.split(',') // response_tags
            );
        }
    }

    window.editorUploadInit = init;
})(jQuery);