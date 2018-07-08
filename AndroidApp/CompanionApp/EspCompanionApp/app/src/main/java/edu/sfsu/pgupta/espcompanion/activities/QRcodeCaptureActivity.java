package edu.sfsu.pgupta.espcompanion.activities;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.util.SparseArray;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.widget.Toast;

import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.vision.CameraSource;
import com.google.android.gms.vision.Detector;
import com.google.android.gms.vision.barcode.Barcode;
import com.google.android.gms.vision.barcode.BarcodeDetector;

import java.io.IOException;


public class QRcodeCaptureActivity extends AppCompatActivity {

    private BarcodeDetector mBarcodeDetector;
    private CameraSource mCameraSource;
    private SurfaceView mSurface;

    public static final String QRCODE_RESULT = "qrcode_result";
    private static final int CAMERA_PERMISSION_REQUEST_CODE = 1;
    private static final String TAG = QRcodeCaptureActivity.class.getSimpleName();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qrcode_capture);

        mSurface = (SurfaceView) findViewById(R.id.surfaceView);

        mBarcodeDetector = new BarcodeDetector.Builder(this)
                .setBarcodeFormats(Barcode.ALL_FORMATS)
                .build();

        mBarcodeDetector.setProcessor(new Detector.Processor(){

            @Override
            public void release() {}

            @Override
            public void receiveDetections(Detector.Detections detections) {
                final SparseArray barcodes = detections.getDetectedItems();
                if(barcodes.size() != 0){
                    Intent result = new Intent();
                    Barcode qrCode = (Barcode) barcodes.valueAt(0);
                    Log.e(TAG,"Inside processor : " + qrCode.displayValue + "");
                    result.putExtra(QRCODE_RESULT, qrCode);
                    setResult(CommonStatusCodes.SUCCESS, result);
                    finish();
                }
            }
        });

        if(ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED){
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA }, CAMERA_PERMISSION_REQUEST_CODE);
        }else{
            initCamera();
        }
    }

    private void initCamera() {
        mCameraSource = new CameraSource.Builder(this, mBarcodeDetector)
                .setRequestedPreviewSize(1600, 1024)
                .setAutoFocusEnabled(true)
                .build();

        mSurface.getHolder().addCallback(new SurfaceHolder.Callback() {

            @Override
            public void surfaceCreated(SurfaceHolder holder) {

                try {
                    if (ActivityCompat.checkSelfPermission(QRcodeCaptureActivity.this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                        //ActivityCompat.requestPermissions();
                        return;
                    }
                    mCameraSource.start(mSurface.getHolder());
                } catch (IOException e) {
                    Log.e(TAG,e.getMessage());
                }
            }

            @Override
            public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
            }

            @Override
            public void surfaceDestroyed(SurfaceHolder holder) {
                mCameraSource.stop();
            }
        });
    }

    @Override
    protected void onStop() {
        super.onStop();
        if(mCameraSource != null) mCameraSource.release();
        if(mBarcodeDetector != null) mBarcodeDetector.release();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if(ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED){
            ActivityCompat.requestPermissions(this,
                    new String[]{ Manifest.permission.CAMERA },
                    CAMERA_PERMISSION_REQUEST_CODE);
        }else{
            initCamera();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        switch(requestCode){
            case CAMERA_PERMISSION_REQUEST_CODE :
                if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    initCamera();
                } else {
                    Log.e(TAG, "Permission not granted");
                    Toast.makeText(this.getApplicationContext(),
                            "Need camera access to scan QR code.",
                            Toast.LENGTH_LONG).show();
                    finish();
                }
                break;
        }
    }
}
