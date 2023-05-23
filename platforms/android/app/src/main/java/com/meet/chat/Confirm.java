package com.meet.chat;

import org.apache.cordova.CallbackContext;

import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.DialogInterface;

public class Confirm extends CordovaPlugin {

	private static final String OPEN_CONFIRM = "openConfirm";

	@SuppressLint("NewApi")
	@Override
	public boolean execute(String action, final JSONArray args,
			final CallbackContext callbackContext) throws JSONException {

		if (action.equals(OPEN_CONFIRM)) {

			try {
				String title = args.getString(0);
				String message = args.getString(1);
				String cancelMessage = args.getString(2);
				String otherMessage = args.getString(3);
				String confirmMessage = args.getString(4);

				AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(
						cordova.getActivity(), AlertDialog.THEME_HOLO_LIGHT);

				alertDialogBuilder.setCancelable(false);
				
				alertDialogBuilder.setNegativeButton(cancelMessage,
						new DialogInterface.OnClickListener() {

							@Override
							public void onClick(DialogInterface arg0, int arg1) {

								String jsonString = "{\"status\" : \"cancel\",\"body\" : \""
										+ "cancel" + "\"}";
								callbackContext.success(jsonString);
							}
						});

				if (!otherMessage.isEmpty())
				{
					alertDialogBuilder.setNeutralButton(otherMessage,
							new DialogInterface.OnClickListener() {
	
								@Override
								public void onClick(DialogInterface arg0, int arg1) {
	
									String jsonString = "{\"status\" : \"cancel\",\"body\" : \""
											+ "other" + "\"}";
									callbackContext.success(jsonString);
								}
							});
				}

				alertDialogBuilder.setPositiveButton(confirmMessage,
						new DialogInterface.OnClickListener() {

							@Override
							public void onClick(DialogInterface arg0, int arg1) {

								String jsonString = "{\"status\" : \"success\",\"body\" : \""
										+ "confirm" + "\"}";
								callbackContext.success(jsonString);
							}
						});

				alertDialogBuilder.setTitle(title);
				alertDialogBuilder.setMessage(message);

				alertDialogBuilder.show();

			} catch (Exception e) {
				callbackContext.error(e.toString());
			}
		}

		return true;

	}

}