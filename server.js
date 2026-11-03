
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map();
const MAX_PLAYERS = 50;
const CAREER = [
  { title: "Thực tập sinh", min: 0, emoji: "🌱" },
  { title: "Nhân viên kế toán", min: 200, emoji: "🧾" },
  { title: "Kế toán viên chính", min: 400, emoji: "📚" },
  { title: "Kế toán tổng hợp", min: 600, emoji: "🧮" },
  { title: "Kế toán trưởng", min: 800, emoji: "👩‍💼" },
  { title: "Giám đốc tài chính", min: 1000, emoji: "🏆" }
];

const missions = [
  { dept:"Kế toán tiền mặt", title:"Kiểm tra quỹ tiền mặt", detail:"Sổ quỹ ghi 25.000.000đ, kiểm kê thực tế có 24.800.000đ. Em nên làm gì trước tiên?", opts:["Tự ý sửa số liệu","Kiểm tra chứng từ và xác minh nguyên nhân","Bỏ qua chênh lệch","Ghi tăng doanh thu"], a:1, why:"Cần đối chiếu chứng từ, biên bản kiểm kê và xác minh nguyên nhân trước khi xử lý chênh lệch.", xp:100 },
  { dept:"Kế toán bán hàng", title:"Khách hàng mua chịu", detail:"Công ty giao hàng 18.000.000đ, khách hàng chưa thanh toán. Khoản mục nào phát sinh?", opts:["Phải thu khách hàng","Phải trả người bán","Chi phí trả trước","Vốn góp"], a:0, why:"Khi bán hàng chưa thu tiền, doanh nghiệp phát sinh khoản phải thu khách hàng.", xp:100 },
  { dept:"Kế toán mua hàng", title:"Nhận hàng chưa thanh toán", detail:"Công ty nhận đủ hàng từ nhà cung cấp nhưng chưa trả tiền. Khoản mục nào tăng?", opts:["Phải thu khách hàng","Phải trả người bán","Doanh thu","Tiền mặt"], a:1, why:"Doanh nghiệp có nghĩa vụ thanh toán cho nhà cung cấp nên phát sinh phải trả người bán.", xp:100 },
  { dept:"Kế toán thuế", title:"Thuế GTGT đầu vào", detail:"Hóa đơn mua hàng hợp lệ có thuế GTGT đầu vào và đáp ứng điều kiện khấu trừ. Khoản thuế được theo dõi là gì?", opts:["Thuế GTGT đầu ra","Thuế TNCN","Thuế GTGT đầu vào được khấu trừ","Thuế tiêu thụ đặc biệt"], a:2, why:"Thuế GTGT đầu vào đủ điều kiện khấu trừ được theo dõi riêng để kê khai theo quy định.", xp:100 },
  { dept:"Kế toán ngân hàng", title:"Khách hàng chuyển khoản", detail:"Khách hàng thanh toán khoản nợ cũ 12.000.000đ qua ngân hàng. Tài khoản tiền nào tăng?", opts:["Tiền mặt","Tiền gửi ngân hàng","Hàng tồn kho","Tạm ứng"], a:1, why:"Tiền gửi ngân hàng tăng, đồng thời khoản phải thu khách hàng giảm.", xp:100 },
  { dept:"Kế toán chi phí", title:"Chi phí văn phòng", detail:"Công ty mua giấy in, bút viết phục vụ văn phòng trị giá 1.500.000đ và thanh toán ngay. Đây thường là khoản gì?", opts:["Doanh thu","Chi phí","Vốn chủ sở hữu","Khoản phải thu"], a:1, why:"Văn phòng phẩm phục vụ hoạt động doanh nghiệp thường được ghi nhận là chi phí phù hợp.", xp:100 },
  { dept:"Kế toán kho", title:"Kiểm kê hàng tồn", detail:"Số lượng trên sổ là 120 sản phẩm, kiểm kê thực tế có 118 sản phẩm. Cách xử lý phù hợp là gì?", opts:["Tự sửa sổ kho","Kiểm tra phiếu nhập xuất và lập biên bản","Xóa dữ liệu kho","Ghi nhận thêm doanh thu"], a:1, why:"Cần kiểm tra chứng từ nhập xuất, xác minh nguyên nhân và lập biên bản kiểm kê.", xp:100 },
  { dept:"Kế toán tổng hợp", title:"Phương trình kế toán", detail:"Phương trình kế toán cơ bản được thể hiện như thế nào?", opts:["Tài sản = Nợ phải trả + Vốn chủ sở hữu","Doanh thu = Tài sản + Chi phí","Tiền = Lợi nhuận × Thuế","Chi phí = Vốn + Hàng tồn kho"], a:0, why:"Phương trình kế toán cơ bản: Tài sản = Nợ phải trả + Vốn chủ sở hữu.", xp:100 },
  { dept:"Kế toán công nợ", title:"Đối chiếu công nợ", detail:"Cuối tháng, số dư công nợ trên sổ khác với xác nhận của nhà cung cấp. Em nên làm gì?", opts:["Chọn số lớn hơn","Bỏ qua vì chênh lệch nhỏ","Đối chiếu hóa đơn, thanh toán và biên bản liên quan","Xóa công nợ"], a:2, why:"Đối chiếu từng chứng từ và giao dịch để tìm nguyên nhân chênh lệch trước khi điều chỉnh.", xp:100 },
  { dept:"Kế toán quản trị", title:"Phân tích chi phí", detail:"Chi phí thực tế tháng này cao hơn ngân sách. Báo cáo quản trị nên làm gì?", opts:["Ẩn khoản vượt ngân sách","Phân tích nguyên nhân chênh lệch và đề xuất kiểm soát","Tự giảm số liệu","Ngừng lập báo cáo"], a:1, why:"Phân tích chênh lệch giúp nhà quản lý hiểu nguyên nhân và đưa ra biện pháp phù hợp.", xp:100 },
  { dept:"Kế toán tiền lương", title:"Bảng lương", detail:"Trước khi chi lương, bộ phận kế toán cần kiểm tra thông tin nào?", opts:["Bảng chấm công và dữ liệu lương đã duyệt","Màu logo công ty","Số lượng khách ghé thăm","Lịch nghỉ của nhà cung cấp"], a:0, why:"Cần đối chiếu dữ liệu chấm công, hợp đồng/chính sách lương và phê duyệt liên quan.", xp:100 },
  { dept:"Kế toán tài sản", title:"Theo dõi tài sản cố định", detail:"Máy móc phục vụ sản xuất được ghi nhận là tài sản cố định khi đáp ứng điều kiện theo quy định. Bộ phận kế toán cần theo dõi thêm nội dung nào?", opts:["Khấu hao và hồ sơ tài sản","Số lượt thích mạng xã hội","Màu bao bì sản phẩm","Lịch ăn trưa"], a:0, why:"Hồ sơ tài sản và khấu hao là nội dung quan trọng trong quản lý tài sản cố định.", xp:100 }
];

function careerFor(xp) {
  return [...CAREER].reverse().find(c => xp >= c.min) || CAREER[0];
}
function roomView(r) {
  return {
    code:r.code, hostId:r.hostId, status:r.status, round:r.round, totalRounds:r.totalRounds,
    players:[...r.players.values()].map(p=>({id:p.id,name:p.name,score:p.score,xp:p.xp,answered:p.answered,career:careerFor(p.xp)})),
    mission:r.status==="playing" ? {dept:r.current.dept,title:r.current.title,detail:r.current.detail,opts:r.current.opts} : null,
    results:r.results || null
  };
}
function update(r){io.to(r.code).emit("room:update",roomView(r));}
function code(){return Math.random().toString(36).slice(2,6).toUpperCase();}
function startRound(r){
  let candidates=missions.map((_,i)=>i).filter(i=>!r.used.includes(i));
  if(!candidates.length){r.used=[];candidates=missions.map((_,i)=>i);}
  const i=candidates[Math.floor(Math.random()*candidates.length)];
  r.used.push(i);r.current=missions[i];r.status="playing";r.results=null;
  for(const p of r.players.values())p.answered=false;
  update(r);
}
function finishRound(r){
  r.status="results";
  r.results=[...r.players.values()].map(p=>({name:p.name,score:p.score,xp:p.xp,career:careerFor(p.xp)})).sort((a,b)=>b.score-a.score);
  update(r);
}
io.on("connection",s=>{
  s.on("room:create",({name})=>{
    let c;do{c=code()}while(rooms.has(c));
    const r={code:c,hostId:s.id,players:new Map(),status:"lobby",round:0,totalRounds:8,current:null,results:null,used:[]};
    r.players.set(s.id,{id:s.id,name:String(name||"Kế toán viên").slice(0,20),score:0,xp:0,answered:false});
    rooms.set(c,r);s.join(c);s.emit("room:joined",roomView(r));update(r);
  });
  s.on("room:join",({name,code:c})=>{
    const r=rooms.get(String(c||"").toUpperCase());
    if(!r)return s.emit("game:error","Không tìm thấy phòng. Em kiểm tra lại mã nhé.");
    if(r.status!=="lobby")return s.emit("game:error","Phòng đã bắt đầu, hiện không thể tham gia.");
    if(r.players.size>=MAX_PLAYERS)return s.emit("game:error","Phòng đã đủ 50 người chơi.");
    r.players.set(s.id,{id:s.id,name:String(name||"Kế toán viên").slice(0,20),score:0,xp:0,answered:false});
    s.join(r.code);s.emit("room:joined",roomView(r));update(r);
  });
  s.on("game:start",()=>{
    const r=[...rooms.values()].find(x=>x.hostId===s.id);
    if(!r||r.status!=="lobby")return;
    r.status="playing";r.round=1;startRound(r);
  });
  s.on("answer:submit",({answer})=>{
    const r=[...rooms.values()].find(x=>x.players.has(s.id));
    if(!r||r.status!=="playing")return;
    const p=r.players.get(s.id);if(p.answered)return;
    p.answered=true;
    const correct=Number(answer)===r.current.a;
    if(correct){p.score+=100;p.xp+=r.current.xp;}
    s.emit("answer:feedback",{correct,why:r.current.why,earned:correct?r.current.xp:0});
    if([...r.players.values()].every(x=>x.answered))finishRound(r);else update(r);
  });
  s.on("game:next",()=>{
    const r=[...rooms.values()].find(x=>x.hostId===s.id);
    if(!r||r.status!=="results")return;
    if(r.round>=r.totalRounds){r.status="finished";update(r);return;}
    r.round++;startRound(r);
  });
  s.on("disconnect",()=>{
    for(const r of rooms.values())if(r.players.has(s.id)){
      r.players.delete(s.id);
      if(!r.players.size)rooms.delete(r.code);
      else{if(r.hostId===s.id)r.hostId=r.players.keys().next().value;update(r);}
    }
  });
});
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log(`Ke Toan Pro Career running on ${PORT}`));
