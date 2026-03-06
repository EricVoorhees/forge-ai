import Component_2_12_1 from './Component_2_12_1';

function Component_2_12() {
  return (
    <div
      className="w-[calc(50%_-_13px)] overflow-x-hidden overflow-y-hidden rounded-br-[12px] rounded-t-[12px] rounded-bl-[12px]"
      data-component-id="Component_2_12"
    >
      <div className="h-full relative overflow-x-hidden overflow-y-hidden">
        <div
          id="home_blog_id_qwen-image-2.0"
          className="text-[20px] h-[354px] z-0 flex overflow-x-hidden overflow-y-hidden flex-col justify-between gap-y-[18px] gap-x-[18px] p-6 rounded-br-[12px] rounded-t-[12px] rounded-bl-[12px] border-[rgba(95,96,108,0.6)] border"
        >
          <Component_2_12_1 />
          <button
            type="button"
            className="bg-[rgba(255,255,255,0)] text-[#f7f8fc] leading-[24px] text-[16px] [white-space-collapse:collapse] [text-wrap-mode:nowrap] w-fit h-12 flex justify-center items-center caret-[#f7f8fc] select-none px-4 py-3 rounded-br-[960px] rounded-t-[960px] rounded-bl-[960px] border-[rgba(95,96,108,0.6)] border"
          >
            <span className="text-center [text-wrap-mode:nowrap] block caret-[#f7f8fc] select-none">
              <span className="[text-wrap-mode:nowrap] caret-[#f7f8fc] select-none">
                Learn more
              </span>
            </span>
            <span className="text-center [text-wrap-mode:nowrap] flex items-center caret-[#f7f8fc] select-none">
              <i className="leading-none not-italic [font-family:iconfont,system-ui,sans-serif] text-[24px] [text-wrap-mode:nowrap] block caret-[#f7f8fc] select-none"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Component_2_12;
