const assert = require('node:assert/strict');
const { collectDonations } = require('../donate-tracker.cjs');
const tx = (time, amount, extra = {}) => ({ time, amount, title: 'Nhận tiền', ...extra });
(async () => {
  const pages = [
    {code:1,data:{transactions:[tx('08/09/2026, 10:00',100),tx('08/09/2026, 09:00',500,{title:'Chuyển tiền'})],next_page:'second'}},
    {code:1,data:{transactions:[tx('07/09/2026, 00:00',200),tx('07/09/2026, 01:00',90,{is_refund:true}),tx('06/09/2026, 23:59',999)],next_page:'older'}}
  ];
  let calls = 0;
  const data = await collectDonations(async cursor => { assert.equal(cursor, calls ? 'second' : ''); return pages[calls++]; }, Date.parse('2026-09-09T00:00:00+07:00'));
  assert.equal(data.total,300); assert.equal(data.count,2); assert.equal(calls,2);
  assert.equal(data.daily[0].cumulative,200); assert.equal(data.daily[1].cumulative,300);
  await assert.rejects(collectDonations(async () => ({code:1,data:{transactions:[],next_page:'same'}})), /lặp/);
  await assert.rejects(collectDonations(async () => ({code:0})), /hợp lệ/);
  console.log('PASS: pagination, start boundary, expenses, refunds, cumulative totals, repeated cursor and API errors');
})();
