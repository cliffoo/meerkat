const fetch = require('node-fetch');
const { link } = require('@blockmason/link-sdk');
web3 = require('web3');
const axios = require('axios');

const height = document.documentElement.clientHeight;
window.onscroll = () => {
  let scrollPercent = window.scrollY / height * 100;
  if (scrollPercent !== 0) {
    let element = document.getElementById('menu');
    element.classList.remove('transparent-background');
    element.classList.add('white-background')
  } else {
    let element = document.getElementById('menu');
    element.classList.remove('white-background');
    element.classList.add('transparent-background');
  }
}

const servers = {
  'AWS': ['https://aws.amazon.com', 0, 0],
  'Kamatera': ['https://www.kamatera.com', 0, 0],
  'DigitalOcean': ['https://www.digitalocean.com', 0, 0],
  'Rackspace': ['https://www.rackspace.com', 0, 0],
  'MassiveGRID': ['https://www.massivegrid.com', 0, 0],
  'AlibabaCloud': ['https://alibabacloud.com', 0, 0],
  'LiquidWeb': ['https://www.liquidweb.com', 0, 0],
  'Azure': ['https://azure.microsoft.com', 0, 0],
  'GoogleCloud': ['https://cloud.google.com', 0, 0],
  'Vmware': ['https://www.vmware.com', 0, 0],
  'Salesforce': ['https://www.salesforce.com', 0, 0],
  'VerizonCloud': ['https://www.verizonwireless.com/solutions-and-services/verizon-cloud', 0, 0],
  'NaviSite': ['https://www.navisite.com/', 0, 0],
  'IBMCloud': ['https://www.ibm.com/cloud', 0, 0],
  'OpenNebula': ['https://opennebula.org', 0, 0],
  'Pivotal': ['https://pivotal.io', 0, 0],
  'CloudSigma': ['https://www.cloudsigma.com/', 0, 0],
  'DellCloud': ['https://www.dellemc.com/en-ca/solutions/cloud/dell-technologies-cloud.htm', 0, 0],
  'Limestone': ['https://www.limestonenetworks.com/cloud/servers.html', 0, 0],
  'Quadranet': ['https://www.quadranet.com/', 0, 0]
}

const renderOrder = ['AWS', 'AlibabaCloud', 'Azure', 'CloudSigma', 'DellCloud', 'DigitalOcean', 'GoogleCloud', 'IBMCloud', 'Kamatera', 'Limestone', 'LiquidWeb', 'MassiveGRID', 'NaviSite', 'OpenNebula', 'Pivotal', 'Quadranet', 'Rackspace', 'Salesforce', 'VerizonCloud', 'Vmware']

const project = link({
  clientId: 'emIPZW0-r9-PJKwfgCm4t-YgdThd72Klu7ve_6USL8s',
  clientSecret: 'lcTK8FUH4wmoLkgPJ0FkUxgcM4PY/grkk3hgoSWIXzZ97bPn4VMbERJAE6nKRNU'
}, {
  fetch
});

const getTestsData = async () => {
  const serverNames = await project.get('/getServerNames');
  const serverResults = await project.get('/getServerResults');
  return [serverNames.result, serverResults.result];
}

const convertBytes32ArrayToStringArray = (bytes32Array) => {
  const stringArray = [];
  for (let i = 0; i < bytes32Array.length; i++) {
    stringArray.push(web3.utils.toAscii(bytes32Array[i]));
  };
  return stringArray;
}

const sliceConvertedStringArray = (stringArray) => {
  const slicedStringArray = [];
  for (let i = 0; i < stringArray.length; i++) {
    let string = stringArray[i];
    let index = string.indexOf('\u0000');
    let slicedString = string.slice(0, index);
    slicedStringArray.push(slicedString)
  };
  return slicedStringArray;
}

const addTest = async (name, result) => {
  const reqBody = {
    "_serverName": web3.utils.asciiToHex(name),
    "_serverResult": result
  }
  try {
    await project.post('/addTest', reqBody);
    console.log('POST CALLED');
  }
  catch (err) {
    console.log('POST FAILED', err);
  }
}

const doTests = () => {
  const serverList = [];
  for (server in servers) {
    serverList.push(server)
  }
  for (var i = 0; i < serverList.length; i++) {
    (function (index) {
      setTimeout(() => {
        console.log(servers[serverList[index]][0]);
        axios.get(`https://cors-anywhere.herokuapp.com/${servers[serverList[index]][0]}`)
          .then(async response => {
            let status = parseInt(((response.status).toString()).substring(0, 1))
            if (status === 4) {
              console.log('Something is wrong with your network!');
            } else if (status === 5) {
              await addTest(serverList[index], false)
            } else if (status === 2) {
              await addTest(serverList[index], true)
            }
          })
          .catch(error => {
            console.log(error)
          })
      }, i * 10000);
    })(i);
  }
}

const load = async () => {
  const results = await getTestsData();
  const serverNames = sliceConvertedStringArray(convertBytes32ArrayToStringArray(results[0]));
  const serverResults = results[1];
  const numberOfResults = serverNames.length;
  for (let i = 0; i < numberOfResults; i++) {
    let name = serverNames[i];
    let result = serverResults[i];
    if (result) {
      servers[name][1] += 1
    } else {
      servers[name][2] += 1
    }
  }
}

const renderResults = () => {
  for (let i = 0; i < renderOrder.length; i++) {
    let success = servers[renderOrder[i]][1];
    let failure = servers[renderOrder[i]][2];
    let total = success + failure;
    let percent = Math.round((success / total) * 100);
    document.getElementById(renderOrder[i]).getElementsByClassName('test-results')[0].getElementsByClassName('test-result')[0].innerHTML = `${success} / ${total}`;
    document.getElementById(renderOrder[i]).getElementsByClassName('test-percents')[0].getElementsByClassName('test-percent')[0].innerHTML = `${percent}%`
  }
}

load().then(() => {
  console.log(servers);
  renderResults();
  doTests();
})



// const reset = async () => {
//   await project.post('/reset');
// }
// reset();