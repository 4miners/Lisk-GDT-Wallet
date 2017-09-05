import { Component } from '@angular/core';
import { NavController, ModalController, ToastController } from 'ionic-angular';

import { LoginPage } from '../login/login';

import { SendModalPage } from '../send-modal/send-modal';
import { ReceiveModalPage } from '../receive-modal/receive-modal';

import { AccountDataProvider } from '../../providers/account-data/account-data';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  accountID: string;
  account: object;
  transactions: object[];
  transactionsCount: number;
  p: number = 1;
  total: number = 0;
  numToDisplay: number = 10;
  contacts: string[];
  contactNames: string[];

  subscriptionTx;

  constructor(public navCtrl: NavController, public accountData: AccountDataProvider, public modalCtrl: ModalController, private toastCtrl: ToastController) {

  }

  ionViewDidLoad() {
    if (this.accountData.hasLoggedIn()) {
      console.log("Logged in");
      this.accountID = this.accountData.getAccountID();
	  this.loadTxs();
      this.subscriptionTx = setInterval(() => { this.loadTxs(); }, 300000);
    } else {
      console.log("Not logged in");
      this.navCtrl.setRoot(LoginPage);
    }
  }

  openModal(modal:string, fullHash:string = null) {
    if (modal == 'send') {
      let myModal = this.modalCtrl.create(SendModalPage);
      myModal.present();
    } else {
      let myModal = this.modalCtrl.create(ReceiveModalPage);
      myModal.present();
    }
  }

  loadTxs() {
  	this.accountData.getContacts().then((currentContacts) => {
        if (currentContacts != null) {
          this.contacts = [];
          this.contactNames = [];
          for (let i=0;i < currentContacts.length; i++) {
            this.contacts.push(currentContacts[i]['account']);
            if (currentContacts[i]['name'] != '') {
              this.contactNames.push(currentContacts[i]['name']);
            } else {
              this.contactNames.push(currentContacts[i]['account']);
            }
          }
        } else {
          this.contacts = [''];
          this.contactNames = [''];
        }
      });
  	this.accountData.getAccount(this.accountID).then((account) => { console.log(account);
	  	this.account = account;
	  });
  	this.accountData.getAccountTransactions(this.accountID, this.numToDisplay, (this.numToDisplay * (this.p-1))).then((transactions) => {
	  	console.log(transactions);
	  	this.transactions = transactions['transactions'];
	  	this.total = transactions['count'];
	  	for (let i=0;i < this.transactions.length; i++) {
	      this.transactions[i]['date'] = new Date((1464109200 + this.transactions[i]['timestamp'])*1000);
	    } 
	  	this.transactionsCount = transactions['count'];
	  });
  }

  addContact(newAccount: string) {
    this.accountData.addContact('',newAccount).then(() => {
      let toast = this.toastCtrl.create({
        message: 'Contact Added',
        duration: 3000,
        position: 'bottom'
      });
      toast.onDidDismiss(() => {
        console.log('Dismissed toast');
      });

      toast.present();
      this.accountData.getContacts().then((currentContacts) => {
        if (currentContacts != null) {
          this.contacts = [];
          this.contactNames = [];
          for (let i=0;i < currentContacts.length; i++) {
            this.contacts.push(currentContacts[i]['account']);
            if (currentContacts[i]['name'] != '') {
              this.contactNames.push(currentContacts[i]['name']);
            } else {
              this.contactNames.push(currentContacts[i]['account']);
            }
          }
        } else {
          this.contacts = [''];
          this.contactNames = [''];
        }
      });
    });  
  }

  pageChanged(event){
  	this.p = event;
  	clearInterval(this.subscriptionTx);
  	this.loadTxs();
  	this.subscriptionTx = setInterval(() => { this.loadTxs(); }, 3000); 
  	console.log(event);
  }

  logout() {
    this.accountData.logout();
    this.navCtrl.setRoot(LoginPage);
  }

  ionViewDidLeave() { 
  	clearInterval(this.subscriptionTx);
  }

}
