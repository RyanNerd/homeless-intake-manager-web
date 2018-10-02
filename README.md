# homeless-intake-manager-web
Intake web portal for Switchpoint (but could be used for any charitable organization homeless shelter/food pantry)

### 💾 Installation
There are two parts to homeless-intake-manager:

`homeless-intake-manager-web`: Which is this repo and is the web or client.
[`homeless-intake-manager-app`](https://github.com/RyanNerd/homeless-intake-manager-app): This is the web service app.

You can clone these repos with:

`git clone RyanNerd/homeless-intake-manager-web`

`git clone RyanNerd/homeless-intake-manager-app`

To Install and run the web component:

`cd homeless-intake-manager-web`
`npm install`

Look at the `.env-example` and create a `.env` file that matches the example configuration.
You should also have the web service running from `homeless-intake-manager-app`

Once you have set up your `.env` and have the web service running you can run a development
 web server with:

`npm run dev`
