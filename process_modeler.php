<?php

defined('_JEXEC') or die('Restricted access');

use Fabrik\Helpers\Image;

require_once COM_FABRIK_FRONTEND . '/models/plugin-list.php';

class PlgFabrik_ListProcess_modeler extends PlgFabrik_List
{
    public function button(&$args)
    {
        parent::button($args);

        return true;
    }

    protected function getImageName()
    {
        return 'brush';
    }

    protected function buttonLabel()
    {
        $params = $this->getParams();

        return $params->get('pm_button_label', 'Modelar');
    }

    protected function getAclParam()
    {
        return 'pm_access';
    }

    public function canSelectRows()
    {
        return false;
    }

    public function onVerifyExistsXml() {
        $table = $_POST['table'];
        $elementBpmn = $_POST['elementBpmn'];
        $rowId = $_POST['rowId'];

        $db = JFactory::getDbo();
        $query = $db->getQuery(true);
        $query->select($elementBpmn)->from($table)->where('id = ' . (int) $rowId);
        $db->setQuery($query);
        $xml = $db->loadResult();

        echo json_encode($xml);
    }

    public function onUpdateXml() {
        $table = $_POST['table'];
        $elementBpmn = $_POST['elementBpmn'];
        $elementStatus = $_POST['elementStatus'];
        $statusValue = $_POST['statusValue'];
        $rowId = $_POST['rowId'];
        $listId = $_POST['listid'];
        $xml = $_POST['xml'];
        $svg = $_POST['svg'];

        $path = '';
        if (!empty($svg)) {
            $m_element_name = $_POST['m_element_name'];
            $m_folder = $_POST['m_folder'];

            if (!JFolder::exists(JPATH_BASE . '/' . $m_folder)) {
                JFolder::create(JPATH_BASE . '/' . $m_folder);
            }

            $path = $m_folder . "/process{$listId}_{$rowId}.svg";
            JFile::write(JPATH_BASE . "/{$path}", $svg);
        }

        $db = JFactory::getDbo();
        $obj = new stdClass();
        $obj->id = $rowId;
        $obj->$elementBpmn = $xml;
        $obj->$elementStatus = $statusValue;
        if ((JFile::exists(JPATH_BASE . "/{$path}")) && (!empty($path))) {
            $obj->$m_element_name = $path;
        }
        $update = $db->updateObject($table, $obj, 'id');

        echo $update;
    }

    public function onLoadJavascriptInstance($args)
    {
        parent::onLoadJavascriptInstance($args);

        $listModel = $this->getModel();
        $worker = FabrikWorker::getPluginManager();
        $params = $this->getParams();

        $opts             = $this->getElementJSOptions();
        $opts->url = COM_FABRIK_LIVESITE;
        $opts->table = $listModel->getTable()->db_table_name;
        $opts->elementBpmn = $worker->getElementPlugin($params->get('pm_bpmn'))->element->name;
        $opts->elementStatus = $worker->getElementPlugin($params->get('pm_status'))->element->name;
        $opts->m_element_name = $worker->getElementPlugin($params->get('pm_miniatura'))->element->name;
        $opts->m_folder = $params->get('pm_miniatura_folder', '/images/stories/miniaturas/');
        $opts->statusValue = $params->get('pm_status_update');
        $opts->pathBpmn = $params->get('pm_path_bpmn');
        $opts             = json_encode($opts);
        $this->jsInstance = "new FbListProcess_modeler($opts)";

        return true;
    }

    public function loadJavascriptClassName_result()
    {
        return 'FbListProcess_modeler';
    }
}