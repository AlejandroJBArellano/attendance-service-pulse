# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration


Copy source to /home/ubuntu, then 

```bash
cd /home/ubuntu/attendance-service-pulse/
npm install
sudo cp attendance-service-pulse.service /lib/systemd/system/
sudo chmod 644 /lib/systemd/system/attendance-service-pulse.service
sudo systemctl daemon-reload
sudo systemctl enable attendance-service-pulse.service
sudo reboot
```

To check logs:
```bash
journalctl -lf -n100 -u attendance-service-pulse
```

* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact