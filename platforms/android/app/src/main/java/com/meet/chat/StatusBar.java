package com.meet.chat;

import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;

import android.app.ActivityManager;
import android.app.Notification;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;


public class StatusBar extends CordovaPlugin {

    private static final String LOG_TAG = "StatusBarPlugin";
	private static int NOTIFICATION_ID = 999;
	private android.app.NotificationManager mManager = null;
	private Context context = null;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if ("goStatusBar".equals(action)) {
            try {      
            	this.context = this.cordova.getActivity().getBaseContext();
                String message = args.getString(0);
				this.addNotification(message);

            } catch (Exception e) {
                Log.e(LOG_TAG, "Exception occurred: ".concat(e.getMessage()));
                return false;
            }
            callbackContext.success();
            return true;
        }
        Log.e(LOG_TAG, "Called invalid action: "+action);
        return false;  
    }
	
	
	private void addNotification(String msg) {

		Notification.Builder builder = new Notification.Builder(
				this.context).setSmallIcon(R.drawable.ic_launcher)
				.setContentTitle("Free Chat")
				.setContentText(msg);

		if (!isActivityRunning()) {
			Intent notificationIntent = new Intent(this.context, meetchat.class);
			PendingIntent contentIntent = PendingIntent.getActivity(this.context, 0,
					notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);
			builder.setContentIntent(contentIntent);

		} else {
			PendingIntent contentIntent = PendingIntent.getActivity(
					this.context, 0, new Intent(this.context, meetchat.class), 0);
			builder.setContentIntent(contentIntent);
		}

		// Add as notification
		mManager = (android.app.NotificationManager) this.context.getSystemService(Context.NOTIFICATION_SERVICE);

		Notification notification = builder.build();

		notification.ledARGB = 0x00FF00;
		notification.flags |= Notification.FLAG_SHOW_LIGHTS;

		notification.ledOnMS = 100; 
		notification.ledOffMS = 100; 

		//notification.defaults |= Notification.DEFAULT_LIGHTS;
		
		mManager.notify(NOTIFICATION_ID, notification);
	}

	protected Boolean isActivityRunning() {
		ActivityManager activityManager = (ActivityManager) this.context
				.getSystemService(Context.ACTIVITY_SERVICE);
		List<ActivityManager.RunningTaskInfo> tasks = activityManager
				.getRunningTasks(Integer.MAX_VALUE);

		for (ActivityManager.RunningTaskInfo task : tasks) {
			if (meetchat.class.getCanonicalName().equalsIgnoreCase(
					task.baseActivity.getClassName()))
				return true;
		}

		return false;
	}
	
	
}