// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as $ } from 'jquery';
// import '../javascripts/jquery.min.js';
// import { default as $ } from '../javascripts/jquery.min.js';
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import tjipcontract_artifacts from '../../build/contracts/TJIPContract.json'

var TJIPContract = contract(tjipcontract_artifacts);
var TJIPContractAddress_rinkeby = "0x1cb54bf5e080496248772e75ca3e634cff92da0b";

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var default_account = "0x6484a4b1baacb294c17a6bc777ab6ccb1c69acd8";
var default_resource = "0x123";
var cur_index = 1;

window.App = {
  start: function () {
    var self = this;

    TJIPContract.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      // self.refreshBalance();
    });
  },

  setStatus: function (message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  // 选择一个页面
  showPage: function(selection) {
    var index = selection.getAttribute('i');
    cur_index = index;
    // 调整样式
    var btns = document.getElementsByClassName('div_tab');
    for (var i=0; i<btns.length; i++) {
      var btn = btns[i];
      if(btn.getAttribute('i') == index) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    }
    // 切换显示block
    var blocks = document.getElementsByClassName('block');
    for (var i=0; i<blocks.length; i++) {
      var block = blocks[i];
      var thisone = block.getAttribute('i') == index;
      block.classList.add(thisone ? 'show':'hide');
      block.classList.remove(thisone ? 'hide':'show');
    }
  },

  // 显示output
  printOutput: function(act, result) {
    var status = result.receipt.status;
    var output = document.querySelector('.block.show').querySelector('.block_output');
    if (result instanceof Array) { // 这种情况认为是call调用得到的结果
      // 未实现（需要每个接口定义对应自身的结果解析格式）
    } else {
      output.innerText += "\n"+act+(status==1?"成功":"失败")+"，status:"+status;
    }
    console.log('$1', result);
  },

  // 公共接口
  joinCommunity: function() {
    var self = this;
    TJIPContract.at(TJIPContractAddress_rinkeby).then(function(instance) {
      return instance.joinCommunity({from: account});
    }).then(function(result) {
      self.printOutput("加入天姬会员", result);
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error joinCommunity; see log.");
    });
  },

  showOriginatorInfo: function () {
    var self = this;
    var originatorAddress = document.getElementById("showOriginatorInfo_originatorAddress").value || default_account;
    TJIPContract.at(TJIPContractAddress_rinkeby).then(function(instance) {
      return instance.queryOriginator(originatorAddress, {from: account});
    }).then(function(result) {
      console.log('$1', result);
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error query originator; see log.");
    });
  },

  showBrokerInfo: function () {
    var self = this;
    var brokerAddress = document.getElementById("showBrokerInfo_brokerAddress").value || default_account;
    TJIPContract.at(TJIPContractAddress_rinkeby).then(function(instance) {
      return instance.queryBroker(brokerAddress, {from: account});
    }).then(function(result) {
      console.log('$1', result);
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error query broker; see log.");
    });
  },

  showResourceInfo: function () {
    var self = this;
    var fileMD5 = document.getElementById("showResourceInfo_fileMD5").value || default_resource;
    TJIPContract.at(TJIPContractAddress_rinkeby).then(function(instance) {
      return instance.queryStakers(fileMD5, {from: account});
    }).then(function(result) {
      console.log('$1', result);
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error query stakers; see log.");
    });
  },

  // 审核方接口
  setRights: function () {
    var self = this;
    var user = document.getElementById("setRights_user").value || default_account;
    var rights = parseInt(document.getElementById("setRights_rights").value) || 0;
    TJIPContract.at(TJIPContractAddress_rinkeby).then(function(instance) {
      return instance.setRights(user, rights, {from: account});
    }).then(function(result) {
      self.printOutput("设置权限", result);
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error setRights; see log.");
    });
  },

  publishInvention: function () {
    var self = this;
    var originatorAddress = document.getElementById("publishInvention_originatorAddress").value || default_account;
    var fileMD5 = document.getElementById("publishInvention_fileMD5").value || default_resource;
    TJIPContract.at(TJIPContractAddress_rinkeby).then(function(instance) {
      return instance.publishInvention(originatorAddress, fileMD5, {from: account});
    }).then(function(result) {
      self.printOutput("发布", result);
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error publishInvention; see log.");
    });
  },

  // 原创者接口
  inventPricing: function () {
    var self = this;
    var fileMD5 = document.getElementById("inventPricing_fileMD5").value || default_resource;
    var basePrice = parseInt(document.getElementById("inventPricing_basePrice").value) || 3;
    basePrice *= 10**17;
    var profitRatio = parseInt(document.getElementById("inventPricing_profitRatio").value) || 20;
    TJIPContract.at(TJIPContractAddress_rinkeby).then(function(instance) {
      return instance.inventPricing(fileMD5, basePrice, profitRatio, {from: account});
    }).then(function(result) {
      self.printOutput("原创资源定价", result);
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sale; see log.");
    });
  },

  // 上传方接口
  sale: function () {
    var self = this;
    var fileMD5 = document.getElementById("sale_fileMD5").value || default_resource;
    var price = parseInt(document.getElementById("sale_price").value) || 13;
    price *= 10**17
    TJIPContract.at(TJIPContractAddress_rinkeby).then(function(instance) {
      return instance.sale(fileMD5, price, {from: account});
    }).then(function(result) {
      self.printOutput("资源上架", result);
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sale; see log.");
    });
  },

  // 购买方接口
  buy: function (fileMD5, brokerAddress) {
    var self = this;
    var value = document.getElementById("buy_value").value || 13;
    value *= 10**17;
    var fileMD5 = document.getElementById("buy_fileMD5").value || default_resource;
    var brokerAddress = document.getElementById("buy_brokerAddress").value || default_account;
    TJIPContract.at(TJIPContractAddress_rinkeby).then(function(instance) {
      return instance.buy(fileMD5, brokerAddress, {from: account, value: value});
    }).then(function(result) {
      self.printOutput("购买资源", result);
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error buy; see log.");
    });
  }
};

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});