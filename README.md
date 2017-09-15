# Mendix-D3PieChartSampleApp

### Overview:
This widget is a wrapper for d3pie library ( http://d3pie.org/# ).
 
### Documentation:
1. Download *Tech Tammina D3 Pie Chart* widget from app store into the project.

2. Create two entities **FinalPieChartData** & **PieChartData**. The attributes in the **FinalPieChartData** entity are calculated values through microflow.

![Alt text](/images/doc1.png?raw=true "Optional Title")

##### Note: The attribute names can be different

3. The PieChartData entity attributes are as follows :
* `Value:` The field name which is to be reported in chart.
* `Caption:` The field name which is to be reported in chart.

4. The FinalPieChartData entity attributes FinalValue, FinalCaption are calculated using microflows as shown below. The value which is present in these attributes is as follows :
* `FinalValue:` Combination of all the data present in Value attribute of PieChartData entity separated by ~.
* `FinalCaption:` Combination of all the data present in value attribute of PieChartData entity separated by ~.

##### Note: The delimiter must be"~". 

![Alt text](/images/doc2.png?raw=true "Optional Title")

5. For displaying chart, place the widget under a dataview and select proper settings mapping the **FinalPieChartData** entity and selecting attributes.

![Alt text](/images/doc3.png?raw=true "Optional Title")

6.Download this sample app and run it in modeler to view the charts which is as shown below:

![Alt text](/images/doc4.png?raw=true "Optional Title")
