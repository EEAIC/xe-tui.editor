(function($){
    function init(cfg) {
        $(function(){ editorFileUploader(cfg); });
    }

    function editorFileUploader(cfg) {
        var request = {
            send: request_uri
                .setQuery('module', 'file')
                .setQuery('act', 'procFileUpload'),
        }

        // create FileUploader
        var uploader = new tui.FileUploader($('#uploader'), {
            url: {
                send: request.send,
                remove: request.send
            },
            isMultiple: false,
            listUI: {
                type: cfg.fileUploadView
            }
        });

        var $uploadedCount = $('#uploadedCount');
        var $itemTotalSize = $('#itemTotalSize');
        var $checkedItemCount = $('#checkedItemCount');
        var $checkedItemSize = $('#checkedItemSize');
        var $removeButton = $('.tui-btn-cancel');

        disableRemoveButton(1);
        // check attached files
        loadFileList(cfg);

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

        function setUploadedCountInfo(count) {
            $uploadedCount.html(count);
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
            if (!editorRelKeys[cfg.editorSequence].primary.val()) {
                editorRelKeys[cfg.editorSequence].primary.val(evt.upload_target_srl);
            }
            
            // var successCount = evt.success;
            // var removeButtonState = (successCount > 0);

            // $uploadedCount.html(successCount);
            // disableRemoveButton(removeButtonState);
            // setUploadedCountInfo(successCount);
            resetInfo();
        });

        // remove file in simple style
        uploader.on('delete', function(evt) {
            var param = {
                file_srls : evt.idList.join(','),
                editor_sequence : cfg.editorSequence
            }

            exec_xml("file","procFileDelete", param, function() { reloadFileList(cfg); });
        });

        // remove file in table style
        $removeButton.on('click', function() {
            var checkedItems = uploader.getCheckedList();
            // uploader.removeList(checkedItems);

            var arr_file_srl = [];
            for (var i = 0; i < checkedItems.length; i++) {
                arr_file_srl.push(checkedItems[i].id);
            }

            var params = {
                file_srls       : arr_file_srl.join(','),
                editor_sequence : cfg.editorSequence
            }
            
            // Requset file delete
            exec_xml("file","procFileDelete", params, function() { reloadFileList(cfg); });
        });

        function reloadFileList(cfg) {
            var isRemoved = true;
            uploader.clear();
            loadFileList(cfg, isRemoved);
        }

        function loadFileList(cfg, isRemoved = false) {
            var params = {
                mid : current_mid,
                file_list_area_id : cfg.fileListAreaID,
                editor_sequence   : cfg.editorSequence,
                upload_target_srl : cfg.upload_target_srl
            };

            function on_complete(ret, response_tags) {
                var files_data =  ret.files.item;               
                
                if (files_data) {                    
                    if (Array.isArray(files_data)){ // remove multiple file 
                        for (var i = 0; i < files_data.length; i++) {
                            files_data[i].name = files_data[i].source_filename;
                            files_data[i].size = files_data[i].file_size;
                            files_data[i].id = files_data[i].file_srl;
                        }
                    } else {
                        files_data.name = files_data.source_filename;
                        files_data.size = files_data.file_size;
                        files_data.id = files_data.file_srl;
                    }
                    uploader.updateList(files_data);
                }
               
                if (isRemoved) {
                    uploader.fire('remove', files_data);
                }
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