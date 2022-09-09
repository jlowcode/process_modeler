define (["jquery", "fab/list-plugin"], function (jQuery, FbListPlugin) {
    var FbListProcess_modeler = new Class ({
        Extends:FbListPlugin,
        initialize: function (options) {
            this.parent(options);
        },
        buttonAction: function () {
            var id_selected = [], input_clicked, xml_bpmn, svg_bpmn, body;
            this.listform.getElements('input[name^=ids]').each(function (id) {
                if (id.get('value') !== false && id.checked !== false) {
                    id_selected.push(id.get('value'));
                }
            });

            if (id_selected.length === 1) {
                if (jQuery("#processModelerModal").length) {
                    jQuery("#processModelerModal").remove();
                    jQuery("#buttonSelected").remove();
                    jQuery("#xml_bpmn").remove();
                }

                var self = this;
                jQuery.ajax ({
                    url: Fabrik.liveSite + 'index.php',
                    method: "POST",
                    data: {
                        'option': 'com_fabrik',
                        'format': 'raw',
                        'task': 'plugin.pluginAjax',
                        'plugin': 'process_modeler',
                        'method': 'verifyExistsXml',
                        'g': 'list',
                        'elementBpmn': self.options.elementBpmn,
                        'table': self.options.table,
                        'rowId': id_selected[0]
                    }
                }).done (function (data) {
                    body = document.getElement('body');

                    xml_bpmn = document.createElement('input');
                    xml_bpmn.setAttribute('type', 'hidden');
                    xml_bpmn.setAttribute('id', 'xml_bpmn');
                    xml_bpmn.setAttribute('value', JSON.parse(data));

                    svg_bpmn = document.createElement('input');
                    svg_bpmn.setAttribute('type', 'hidden');
                    svg_bpmn.setAttribute('id', 'svg_bpmn');

                    body.appendChild(xml_bpmn);
                    body.appendChild(svg_bpmn);

                    self.createModal();
                    input_clicked = document.getElementById('buttonClicked');
                    input_clicked.setAttribute('value', id_selected[0]);
                    self.openModal();
                });
            }
        },
        createModal: function() {
            var modal = document.createElement('div');
            modal.setAttribute('class', 'process_modeler-modal');
            modal.setAttribute('id', 'processModelerModal');

            var modalContent = document.createElement('div');
            modalContent.setAttribute('class', 'process_modeler-modal-content');

            var modalHeader = document.createElement('div');
            modalHeader.setAttribute('class', 'process_modeler-modal-header');
            var buttonClose = document.createElement('span');
            buttonClose.setAttribute('class', 'process_modeler-modal-close');
            buttonClose.innerHTML = '&times;';
            var title = document.createElement('h2');
            title.innerHTML = 'Modelagem';
            modalHeader.appendChild(buttonClose);
            modalHeader.appendChild(title);

            var modalBody = document.createElement('div');
            modalBody.setAttribute('class', 'process_modeler-modal-body');

            var content = document.createElement('div');
            content.innerHTML = "<div class=\"content\" id=\"js-drop-zone\">\n" +
                "<div class=\"message intro\">\n" +
                "                    <div class=\"note\">\n" +
                "                        Solte um arquivo .bpmn ou <a id=\"js-create-diagram\" href>crie um novo diagrama</a> para iniciar.\n" +
                "                    </div>\n" +
                "                </div>" +
                "<div class=\"message error\">\n" +
                "      <div class=\"note\">\n" +
                "        <p>Ooops, we could not display the BPMN 2.0 diagram.</p>\n" +
                "\n" +
                "        <div class=\"details\">\n" +
                "          <span>cause of the problem</span>\n" +
                "          <pre></pre>\n" +
                "        </div>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "    <div class=\"canvas\" id=\"js-canvas\"></div>\n" +
                "  </div>\n";

            modalBody.appendChild(content);

            /*var frameBPMN = document.createElement('iframe');
            frameBPMN.setAttribute('src', Fabrik.liveSite + 'plugins/fabrik_list/process_modeler/modeler/public/index.html');
            frameBPMN.setAttribute('style', 'width: 100%; height: 1500px');
            modalBody.appendChild(frameBPMN);*/

            var modalFooter = document.createElement('div');
            modalFooter.setAttribute('class', 'process_modeler-modal-footer');

            var saveButton = document.createElement('button');
            saveButton.setAttribute('class', 'btn btn-default');
            saveButton.setAttribute('id', 'saveButton');
            saveButton.setAttribute('style', 'margin: 5px')
            saveButton.innerHTML = "Salvar";
            saveButton.onclick = () => {
                var value_xml = document.getElementById('xml_bpmn').value;
                var value_svg = document.getElementById('svg_bpmn').value;
                var row = document.getElementById('buttonClicked').value;
                var self = this;
                jQuery.ajax ({
                    url: Fabrik.liveSite + 'index.php',
                    method: "POST",
                    data: {
                        'option': 'com_fabrik',
                        'format': 'raw',
                        'task': 'plugin.pluginAjax',
                        'plugin': 'process_modeler',
                        'method': 'updateXml',
                        'g': 'list',
                        'listid': self.options.listid,
                        'elementBpmn': self.options.elementBpmn,
                        'elementStatus': self.options.elementStatus,
                        'statusValue': self.options.statusValue,
                        'table': self.options.table,
                        'rowId': row,
                        'xml': value_xml,
                        'svg': value_svg,
                        'm_element_name': self.options.m_element_name,
                        'm_folder': self.options.m_folder
                    }
                }).done (function (data) {
                    window.location.reload(true);
                });
            }
            modalFooter.appendChild(saveButton);

            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalBody);
            modalContent.appendChild(modalFooter);
            modal.appendChild(modalContent);

            var input_clicked = document.createElement('input');
            input_clicked.setAttribute('type', 'hidden');
            input_clicked.setAttribute('id', 'buttonClicked');

            var body = document.getElement("body");
            var head = document.getElement('head');
            var linkCss = document.createElement('link');
            linkCss.setAttribute('href', this.options.url + 'plugins/fabrik_list/process_modeler/modal/modal.css');
            linkCss.setAttribute('rel', 'stylesheet');

            var css1 = document.createElement('link');
            var css2 = document.createElement('link');
            var css3 = document.createElement('link');

            css1.setAttribute('rel', 'stylesheet');
            css2.setAttribute('rel', 'stylesheet');
            css3.setAttribute('rel', 'stylesheet');
            css1.setAttribute('href', Fabrik.liveSite + "plugins/fabrik_list/process_modeler/modeler/public/vendor/bpmn-js/assets/diagram-js.css");
            css2.setAttribute('href', Fabrik.liveSite + "plugins/fabrik_list/process_modeler/modeler/public/vendor/bpmn-js/assets/bpmn-font/css/bpmn-embedded.css");
            css3.setAttribute('href', Fabrik.liveSite + "plugins/fabrik_list/process_modeler/modeler/public/css/app.css");

            head.appendChild(css1);
            head.appendChild(css2);
            head.appendChild(css3);

            var script1 = document.createElement('script');
            script1.setAttribute('src', Fabrik.liveSite + "plugins/fabrik_list/process_modeler/modeler/public/app.js");

            body.appendChild(modal);
            body.appendChild(input_clicked);
            head.appendChild(linkCss);
            head.appendChild(script1);
        },
        openModal: function () {
            var modal = document.getElementById("processModelerModal");
            var body = document.getElement("body");

            body.style.overflowY = "hidden";
            modal.style.display = "block";

            var span = document.getElementsByClassName("process_modeler-modal-close")[0];

            span.onclick = function() {
                modal.style.display = "none";
                body.style.overflowY = "auto";
            };

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                    body.style.overflowY = "auto";
                }
            };
        },
    });

    return FbListProcess_modeler;
});