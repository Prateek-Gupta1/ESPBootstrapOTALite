package edu.sfsu.pgupta.espcompanion.adapters;

import android.content.Context;
import android.databinding.DataBindingUtil;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.ViewGroup;

import java.util.List;

import edu.sfsu.pgupta.espcompanion.activities.R;
import edu.sfsu.pgupta.espcompanion.activities.databinding.ArduinoDeviceItemBinding;
import edu.sfsu.pgupta.espcompanion.data.models.ArduinoDevice;
import edu.sfsu.pgupta.espcompanion.viewmodels.ArduinoDeviceViewModel;

public class ArduinoDeviceListAdapter extends RecyclerView.Adapter<ArduinoDeviceListAdapter.BindingHolder> {
    private List<ArduinoDevice> mData;
    private Context mContext;

    public ArduinoDeviceListAdapter(List<ArduinoDevice> mData, Context mContext) {
        this.mData = mData;
        this.mContext = mContext;
    }

    @Override
    public BindingHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        ArduinoDeviceItemBinding binding = DataBindingUtil.inflate(LayoutInflater.from(parent.getContext()),
                R.layout.arduino_device_item, parent, false);
        return new BindingHolder(binding);
    }

    @Override
    public void onBindViewHolder(BindingHolder holder, int position) {
        ArduinoDeviceItemBinding binding = holder.binding;
        binding.setAdvm(new ArduinoDeviceViewModel(mContext, mData.get(position)));
    }

    @Override
    public long getItemId(int position) {
        return mData.get(position).getRegisteredOn();
    }

    @Override
    public int getItemViewType(int position) {
        return super.getItemViewType(position);
    }

    @Override
    public int getItemCount() {
        return mData.size();
    }

    public static class BindingHolder extends RecyclerView.ViewHolder{

        ArduinoDeviceItemBinding binding;

        public BindingHolder(ArduinoDeviceItemBinding binding) {
            super(binding.arDeviceItem);
            this.binding = binding;
        }
    }

    public List<ArduinoDevice> getDeviceList(){
        return mData;
    }
}
