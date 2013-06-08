/*
  vmd Exporter
    あかつきみさき(みくちぃP)

  このスクリプトについて
    After EffectsのアクティブカメラをMMDモーションデータ(.vmd)として出力します.

  使用方法
    ファイル→スクリプトから実行してください.

  ライセンスについて
    このスクリプトはらくさん氏作成のyaAE2MMD.jsx v1.0.3を元に作成しています.
    また,glMatrix ( http://code.google.com/p/glmatrix/ ) が含まれています.
    glMatrix 部分はNew BSD Licenseです.
    それ以外の部分(らくさん氏作成のyaAE2MMD.jsx v1.0.3を含む)はMIT Licenseです.

  yaAE2MMDとの違いについて
    ファイル出力時のvmd指定.
    前回入力した値を環境設定変数に保存.

  動作確認環境
    Adobe After Effects CS5以上

  バージョン情報
    2013/06/09 Ver 1.1.0 Update
      CS6の正式対応. 今後のためのライト処理の追加.
      アクセス方法をmatchNameにした.

    2012/09/12 Ver 1.0.0 Release
*/

/*
 * yaAE2MMD.jsx v1.0.3
 * これはAEのカメラをMMDのモーションデータ形式(VMD)で書き出すスクリプトです。
 * 
 * このファイルには glMatrix ( http://code.google.com/p/glmatrix/ ) が
 * 含まれています。glMatrix 部分は New BSD License です。それ以外の部分は
 * MIT License です。
 * 
 * 
 * 使い方
 *   AEで [ファイル] -> [スクリプト] -> [スクリプトファイルを実行] を選んで
 *   このJSXファイルを指定してください。もしくは、AEのスクリプトフォルダに
 *   このファイルを入れてAEを再起動すると [ファイル] -> [スクリプト] 以下に
 *   登録されるので、それを選択してください。
 * 
 * スケールと位置の調整
 *   このスクリプトを実行すると最初に表示されるダイアログで「スケール」と
 *   「位置の基準」を変更すると、MMDモデルのサイズや位置との調整を行うことが
 *   できます。
 * 
 * カメラの制限事項
 *   カメラまたはカメラの親が次のいずれかに該当する場合、カメラデータを正しく
 *   書き出すことができません。
 * 
 *     ・自動方向オプションを「パスに沿って方向を設定」としている
 *     ・ポイントまたはアンビエントのライト
 * 
 *   これら以外にもカメラデータを正しく書き出せない場合があるかもしれませんが、
 *   十分な検証を行っていないため不明です。
 * 
 * MMDの視野角とAEのズームについて
 *   MMDの視野角はVMDファイル上では整数値しか取ることができません。そのため、
 *   MMDの視野角がちょうど整数値となるようにAEのズームを設定していないと、
 *   わずかなズレが生じるので注意してください。MMDの視野角は、次の計算式で
 *   求めることができます。
 * 
 *     視野角 = 2*atan(コンポジションの高さ/2/ズーム)
 * 
 * 
 * 
 * 動作環境
 *   たぶん Adobe After Effects CS3 以降
 * 
 * 免責事項、再配布条件など
 *   このスクリプトは無保証です。自己責任にてお使いください。改変、再配布等は
 *   MIT License (glMatrix 部分は New BSD License) のもとで自由に行えます。
 * 
 * 作者および連絡先
 *   らくさん (Yoshikazu Kuramochi)
 *   http://twitter.com/rakusan
 * 
 * その他の情報
 *   このスクリプトは Javie ( http://sourceforge.jp/projects/javie/ ) に
 *   搭載されている同様の機能をAE向けに書き換えたものです。
 * 
 * 更新履歴
 *   2011-06-28 v1.0.3
 *     ・スケールと位置の基準を入力するUIを実装
 * 
 *   2011-06-26 v1.0.2
 *     ・カメラの自動方向オプションがオフになっている場合に対応
 * 
 *   2011-06-25 v1.0.1
 *     ・MMD上で角度Zが0となる場合に不正な結果となることがあるバグを修正
 *     ・照明のキーフレームが1つ勝手に追加されてしまうバグを修正
 * 
 *   2011-06-25 v1.0
 *     ・初版
 */

/*
 * Copyright (c) 2011 Yoshikazu Kuramochi
 * All rights reserved.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


// glMatrix v0.9.5
/*
 * Copyright (c) 2010 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */


(function() {

// glMatrix
glMatrixArrayType=typeof Float32Array!="undefined"?Float32Array:typeof WebGLFloatArray!="undefined"?WebGLFloatArray:Array;var vec3={};vec3.create=function(a){var b=new glMatrixArrayType(3);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2]}return b};vec3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};vec3.add=function(a,b,c){if(!c||a==c){a[0]+=b[0];a[1]+=b[1];a[2]+=b[2];return a}c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];return c};
vec3.subtract=function(a,b,c){if(!c||a==c){a[0]-=b[0];a[1]-=b[1];a[2]-=b[2];return a}c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];return c};vec3.negate=function(a,b){b||(b=a);b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];return b};vec3.scale=function(a,b,c){if(!c||a==c){a[0]*=b;a[1]*=b;a[2]*=b;return a}c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;return c};
vec3.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=Math.sqrt(c*c+d*d+e*e);if(g){if(g==1){b[0]=c;b[1]=d;b[2]=e;return b}}else{b[0]=0;b[1]=0;b[2]=0;return b}g=1/g;b[0]=c*g;b[1]=d*g;b[2]=e*g;return b};vec3.cross=function(a,b,c){c||(c=a);var d=a[0],e=a[1];a=a[2];var g=b[0],f=b[1];b=b[2];c[0]=e*b-a*f;c[1]=a*g-d*b;c[2]=d*f-e*g;return c};vec3.length=function(a){var b=a[0],c=a[1];a=a[2];return Math.sqrt(b*b+c*c+a*a)};vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
vec3.direction=function(a,b,c){c||(c=a);var d=a[0]-b[0],e=a[1]-b[1];a=a[2]-b[2];b=Math.sqrt(d*d+e*e+a*a);if(!b){c[0]=0;c[1]=0;c[2]=0;return c}b=1/b;c[0]=d*b;c[1]=e*b;c[2]=a*b;return c};vec3.lerp=function(a,b,c,d){d||(d=a);d[0]=a[0]+c*(b[0]-a[0]);d[1]=a[1]+c*(b[1]-a[1]);d[2]=a[2]+c*(b[2]-a[2]);return d};vec3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+"]"};var mat3={};
mat3.create=function(a){var b=new glMatrixArrayType(9);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9]}return b};mat3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};mat3.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a};
mat3.transpose=function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[5];a[1]=a[3];a[2]=a[6];a[3]=c;a[5]=a[7];a[6]=d;a[7]=e;return a}b[0]=a[0];b[1]=a[3];b[2]=a[6];b[3]=a[1];b[4]=a[4];b[5]=a[7];b[6]=a[2];b[7]=a[5];b[8]=a[8];return b};mat3.toMat4=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=0;b[4]=a[3];b[5]=a[4];b[6]=a[5];b[7]=0;b[8]=a[6];b[9]=a[7];b[10]=a[8];b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+"]"};var mat4={};mat4.create=function(a){var b=new glMatrixArrayType(16);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15]}return b};
mat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};mat4.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a};
mat4.transpose=function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[3],g=a[6],f=a[7],h=a[11];a[1]=a[4];a[2]=a[8];a[3]=a[12];a[4]=c;a[6]=a[9];a[7]=a[13];a[8]=d;a[9]=g;a[11]=a[14];a[12]=e;a[13]=f;a[14]=h;return a}b[0]=a[0];b[1]=a[4];b[2]=a[8];b[3]=a[12];b[4]=a[1];b[5]=a[5];b[6]=a[9];b[7]=a[13];b[8]=a[2];b[9]=a[6];b[10]=a[10];b[11]=a[14];b[12]=a[3];b[13]=a[7];b[14]=a[11];b[15]=a[15];return b};
mat4.determinant=function(a){var b=a[0],c=a[1],d=a[2],e=a[3],g=a[4],f=a[5],h=a[6],i=a[7],j=a[8],k=a[9],l=a[10],o=a[11],m=a[12],n=a[13],p=a[14];a=a[15];return m*k*h*e-j*n*h*e-m*f*l*e+g*n*l*e+j*f*p*e-g*k*p*e-m*k*d*i+j*n*d*i+m*c*l*i-b*n*l*i-j*c*p*i+b*k*p*i+m*f*d*o-g*n*d*o-m*c*h*o+b*n*h*o+g*c*p*o-b*f*p*o-j*f*d*a+g*k*d*a+j*c*h*a-b*k*h*a-g*c*l*a+b*f*l*a};
mat4.inverse=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],o=a[10],m=a[11],n=a[12],p=a[13],r=a[14],s=a[15],A=c*h-d*f,B=c*i-e*f,t=c*j-g*f,u=d*i-e*h,v=d*j-g*h,w=e*j-g*i,x=k*p-l*n,y=k*r-o*n,z=k*s-m*n,C=l*r-o*p,D=l*s-m*p,E=o*s-m*r,q=1/(A*E-B*D+t*C+u*z-v*y+w*x);b[0]=(h*E-i*D+j*C)*q;b[1]=(-d*E+e*D-g*C)*q;b[2]=(p*w-r*v+s*u)*q;b[3]=(-l*w+o*v-m*u)*q;b[4]=(-f*E+i*z-j*y)*q;b[5]=(c*E-e*z+g*y)*q;b[6]=(-n*w+r*t-s*B)*q;b[7]=(k*w-o*t+m*B)*q;b[8]=(f*D-h*z+j*x)*q;
b[9]=(-c*D+d*z-g*x)*q;b[10]=(n*v-p*t+s*A)*q;b[11]=(-k*v+l*t-m*A)*q;b[12]=(-f*C+h*y-i*x)*q;b[13]=(c*C-d*y+e*x)*q;b[14]=(-n*u+p*B-r*A)*q;b[15]=(k*u-l*B+o*A)*q;return b};mat4.toRotationMat=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat4.toMat3=function(a,b){b||(b=mat3.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[4];b[4]=a[5];b[5]=a[6];b[6]=a[8];b[7]=a[9];b[8]=a[10];return b};mat4.toInverseMat3=function(a,b){var c=a[0],d=a[1],e=a[2],g=a[4],f=a[5],h=a[6],i=a[8],j=a[9],k=a[10],l=k*f-h*j,o=-k*g+h*i,m=j*g-f*i,n=c*l+d*o+e*m;if(!n)return null;n=1/n;b||(b=mat3.create());b[0]=l*n;b[1]=(-k*d+e*j)*n;b[2]=(h*d-e*f)*n;b[3]=o*n;b[4]=(k*c-e*i)*n;b[5]=(-h*c+e*g)*n;b[6]=m*n;b[7]=(-j*c+d*i)*n;b[8]=(f*c-d*g)*n;return b};
mat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],f=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],o=a[9],m=a[10],n=a[11],p=a[12],r=a[13],s=a[14];a=a[15];var A=b[0],B=b[1],t=b[2],u=b[3],v=b[4],w=b[5],x=b[6],y=b[7],z=b[8],C=b[9],D=b[10],E=b[11],q=b[12],F=b[13],G=b[14];b=b[15];c[0]=A*d+B*h+t*l+u*p;c[1]=A*e+B*i+t*o+u*r;c[2]=A*g+B*j+t*m+u*s;c[3]=A*f+B*k+t*n+u*a;c[4]=v*d+w*h+x*l+y*p;c[5]=v*e+w*i+x*o+y*r;c[6]=v*g+w*j+x*m+y*s;c[7]=v*f+w*k+x*n+y*a;c[8]=z*d+C*h+D*l+E*p;c[9]=z*e+C*i+D*o+E*r;c[10]=z*
g+C*j+D*m+E*s;c[11]=z*f+C*k+D*n+E*a;c[12]=q*d+F*h+G*l+b*p;c[13]=q*e+F*i+G*o+b*r;c[14]=q*g+F*j+G*m+b*s;c[15]=q*f+F*k+G*n+b*a;return c};mat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1];b=b[2];c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];return c};
mat4.multiplyVec4=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=b[3];c[0]=a[0]*d+a[4]*e+a[8]*g+a[12]*b;c[1]=a[1]*d+a[5]*e+a[9]*g+a[13]*b;c[2]=a[2]*d+a[6]*e+a[10]*g+a[14]*b;c[3]=a[3]*d+a[7]*e+a[11]*g+a[15]*b;return c};
mat4.translate=function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[12]=a[0]*d+a[4]*e+a[8]*b+a[12];a[13]=a[1]*d+a[5]*e+a[9]*b+a[13];a[14]=a[2]*d+a[6]*e+a[10]*b+a[14];a[15]=a[3]*d+a[7]*e+a[11]*b+a[15];return a}var g=a[0],f=a[1],h=a[2],i=a[3],j=a[4],k=a[5],l=a[6],o=a[7],m=a[8],n=a[9],p=a[10],r=a[11];c[0]=g;c[1]=f;c[2]=h;c[3]=i;c[4]=j;c[5]=k;c[6]=l;c[7]=o;c[8]=m;c[9]=n;c[10]=p;c[11]=r;c[12]=g*d+j*e+m*b+a[12];c[13]=f*d+k*e+n*b+a[13];c[14]=h*d+l*e+p*b+a[14];c[15]=i*d+o*e+r*b+a[15];return c};
mat4.scale=function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[0]*=d;a[1]*=d;a[2]*=d;a[3]*=d;a[4]*=e;a[5]*=e;a[6]*=e;a[7]*=e;a[8]*=b;a[9]*=b;a[10]*=b;a[11]*=b;return a}c[0]=a[0]*d;c[1]=a[1]*d;c[2]=a[2]*d;c[3]=a[3]*d;c[4]=a[4]*e;c[5]=a[5]*e;c[6]=a[6]*e;c[7]=a[7]*e;c[8]=a[8]*b;c[9]=a[9]*b;c[10]=a[10]*b;c[11]=a[11]*b;c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15];return c};
mat4.rotate=function(a,b,c,d){var e=c[0],g=c[1];c=c[2];var f=Math.sqrt(e*e+g*g+c*c);if(!f)return null;if(f!=1){f=1/f;e*=f;g*=f;c*=f}var h=Math.sin(b),i=Math.cos(b),j=1-i;b=a[0];f=a[1];var k=a[2],l=a[3],o=a[4],m=a[5],n=a[6],p=a[7],r=a[8],s=a[9],A=a[10],B=a[11],t=e*e*j+i,u=g*e*j+c*h,v=c*e*j-g*h,w=e*g*j-c*h,x=g*g*j+i,y=c*g*j+e*h,z=e*c*j+g*h;e=g*c*j-e*h;g=c*c*j+i;if(d){if(a!=d){d[12]=a[12];d[13]=a[13];d[14]=a[14];d[15]=a[15]}}else d=a;d[0]=b*t+o*u+r*v;d[1]=f*t+m*u+s*v;d[2]=k*t+n*u+A*v;d[3]=l*t+p*u+B*
v;d[4]=b*w+o*x+r*y;d[5]=f*w+m*x+s*y;d[6]=k*w+n*x+A*y;d[7]=l*w+p*x+B*y;d[8]=b*z+o*e+r*g;d[9]=f*z+m*e+s*g;d[10]=k*z+n*e+A*g;d[11]=l*z+p*e+B*g;return d};mat4.rotateX=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[4],g=a[5],f=a[6],h=a[7],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[0]=a[0];c[1]=a[1];c[2]=a[2];c[3]=a[3];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[4]=e*b+i*d;c[5]=g*b+j*d;c[6]=f*b+k*d;c[7]=h*b+l*d;c[8]=e*-d+i*b;c[9]=g*-d+j*b;c[10]=f*-d+k*b;c[11]=h*-d+l*b;return c};
mat4.rotateY=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[4]=a[4];c[5]=a[5];c[6]=a[6];c[7]=a[7];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*-d;c[1]=g*b+j*-d;c[2]=f*b+k*-d;c[3]=h*b+l*-d;c[8]=e*d+i*b;c[9]=g*d+j*b;c[10]=f*d+k*b;c[11]=h*d+l*b;return c};
mat4.rotateZ=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[4],j=a[5],k=a[6],l=a[7];if(c){if(a!=c){c[8]=a[8];c[9]=a[9];c[10]=a[10];c[11]=a[11];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*d;c[1]=g*b+j*d;c[2]=f*b+k*d;c[3]=h*b+l*d;c[4]=e*-d+i*b;c[5]=g*-d+j*b;c[6]=f*-d+k*b;c[7]=h*-d+l*b;return c};
mat4.frustum=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=e*2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=e*2/i;f[6]=0;f[7]=0;f[8]=(b+a)/h;f[9]=(d+c)/i;f[10]=-(g+e)/j;f[11]=-1;f[12]=0;f[13]=0;f[14]=-(g*e*2)/j;f[15]=0;return f};mat4.perspective=function(a,b,c,d,e){a=c*Math.tan(a*Math.PI/360);b=a*b;return mat4.frustum(-b,b,-a,a,c,d,e)};
mat4.ortho=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=2/i;f[6]=0;f[7]=0;f[8]=0;f[9]=0;f[10]=-2/j;f[11]=0;f[12]=-(a+b)/h;f[13]=-(d+c)/i;f[14]=-(g+e)/j;f[15]=1;return f};
mat4.lookAt=function(a,b,c,d){d||(d=mat4.create());var e=a[0],g=a[1];a=a[2];var f=c[0],h=c[1],i=c[2];c=b[1];var j=b[2];if(e==b[0]&&g==c&&a==j)return mat4.identity(d);var k,l,o,m;c=e-b[0];j=g-b[1];b=a-b[2];m=1/Math.sqrt(c*c+j*j+b*b);c*=m;j*=m;b*=m;k=h*b-i*j;i=i*c-f*b;f=f*j-h*c;if(m=Math.sqrt(k*k+i*i+f*f)){m=1/m;k*=m;i*=m;f*=m}else f=i=k=0;h=j*f-b*i;l=b*k-c*f;o=c*i-j*k;if(m=Math.sqrt(h*h+l*l+o*o)){m=1/m;h*=m;l*=m;o*=m}else o=l=h=0;d[0]=k;d[1]=h;d[2]=c;d[3]=0;d[4]=i;d[5]=l;d[6]=j;d[7]=0;d[8]=f;d[9]=
o;d[10]=b;d[11]=0;d[12]=-(k*e+i*g+f*a);d[13]=-(h*e+l*g+o*a);d[14]=-(c*e+j*g+b*a);d[15]=1;return d};mat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+", "+a[9]+", "+a[10]+", "+a[11]+", "+a[12]+", "+a[13]+", "+a[14]+", "+a[15]+"]"};quat4={};quat4.create=function(a){var b=new glMatrixArrayType(4);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3]}return b};quat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];return b};
quat4.calculateW=function(a,b){var c=a[0],d=a[1],e=a[2];if(!b||a==b){a[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return a}b[0]=c;b[1]=d;b[2]=e;b[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return b};quat4.inverse=function(a,b){if(!b||a==b){a[0]*=1;a[1]*=1;a[2]*=1;return a}b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];b[3]=a[3];return b};quat4.length=function(a){var b=a[0],c=a[1],d=a[2];a=a[3];return Math.sqrt(b*b+c*c+d*d+a*a)};
quat4.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=Math.sqrt(c*c+d*d+e*e+g*g);if(f==0){b[0]=0;b[1]=0;b[2]=0;b[3]=0;return b}f=1/f;b[0]=c*f;b[1]=d*f;b[2]=e*f;b[3]=g*f;return b};quat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2];a=a[3];var f=b[0],h=b[1],i=b[2];b=b[3];c[0]=d*b+a*f+e*i-g*h;c[1]=e*b+a*h+g*f-d*i;c[2]=g*b+a*i+d*h-e*f;c[3]=a*b-d*f-e*h-g*i;return c};
quat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=a[0];var f=a[1],h=a[2];a=a[3];var i=a*d+f*g-h*e,j=a*e+h*d-b*g,k=a*g+b*e-f*d;d=-b*d-f*e-h*g;c[0]=i*a+d*-b+j*-h-k*-f;c[1]=j*a+d*-f+k*-b-i*-h;c[2]=k*a+d*-h+i*-f-j*-b;return c};quat4.toMat3=function(a,b){b||(b=mat3.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=k+g;b[4]=1-(j+e);b[5]=d-f;b[6]=c-h;b[7]=d+f;b[8]=1-(j+l);return b};
quat4.toMat4=function(a,b){b||(b=mat4.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=0;b[4]=k+g;b[5]=1-(j+e);b[6]=d-f;b[7]=0;b[8]=c-h;b[9]=d+f;b[10]=1-(j+l);b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};quat4.slerp=function(a,b,c,d){d||(d=a);var e=c;if(a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]<0)e=-1*c;d[0]=1-c*a[0]+e*b[0];d[1]=1-c*a[1]+e*b[1];d[2]=1-c*a[2]+e*b[2];d[3]=1-c*a[3]+e*b[3];return d};
quat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+"]"};
// End of glMatrix

var vmdExpObj = (function() {
  var canRunVersion, scriptName, scriptURLName, scriptURLVersion, scriptVersionNumber;
  scriptName = "vmd Exporter";
  scriptURLName = "vmdExporter";
  scriptVersionNumber = "1.1.0";
  scriptURLVersion = 1.10;
  canRunVersion = 10.0;
  return {
    getScriptName: function() {
      return scriptName;
    },
    getScriptURLName: function() {
      return scriptURLName;
    },
    getScriptVersionNumber: function() {
      return scriptVersionNumber;
    },
    getScriptURLVersion: function() {
      return scriptURLVersion;
    },
    getCanRunVersion: function() {
      return canRunVersion;
      }
    }
})();

var EXTENSION_VMD = ".vmd";

Application.prototype.runAeVersionCheck = function(AeVersion) {
  if (parseFloat(this.version) < vmdExpObj.getCanRunVersion()) {
    return false;
  } else {
    return true;
  }
}

isCompActive = function(selComp) {
  if (!(selComp && selComp instanceof CompItem)) {
    return false;
  } else {
    return true;
  }
}


if(! app.runAeVersionCheck(10.0)){
  return 0;
}

var myComp = app.project.activeItem;

if(! isCompActive(myComp)){
  return 0;
}

setDefSettings = function(key, value){
  if(app.settings.haveSetting(vmdExpObj.getScriptURLName(), key) == false){
    app.settings.saveSetting(vmdExpObj.getScriptURLName(), key, value);
  }
}

setDefSettings("SCALE",　5);
setDefSettings("X_POINT", myComp.width * 0.5);
setDefSettings("Y_POINT", myComp.height * 0.5);
setDefSettings("Z_POINT", 0);

var scale = eval(app.settings.getSetting(vmdExpObj.getScriptURLName(),"SCALE"));
var ox    = eval(app.settings.getSetting(vmdExpObj.getScriptURLName(),"X_POINT"));
var oy    = eval(app.settings.getSetting(vmdExpObj.getScriptURLName(),"Y_POINT"));
var oz    = eval(app.settings.getSetting(vmdExpObj.getScriptURLName(),"Z_POINT"));

while (true){
  var dlgRes =
    "dialog {" +
    "  contentGrp: Group {" +
    "    orientation: 'column', alignment:['fill','fill'], alignChildren:['fill','top']," +
    "    scaleGrp: Group {" +
    "      alignment:['fill','top']," +
    "      s: StaticText { text:'scale:\t'\t }," +
    "      e: EditText { preferredSize:[70, 20] }," +
    "      u: StaticText { text:'%' }" +
    "    }," +
    "    offsetGrp: Group {" +
    "      alignment:['fill','top']," +
    "      s: StaticText { text:'position:' }," +
    "      sx: StaticText { text:'x =' }," +
    "      ex: EditText { preferredSize:[70, 20] }," +
    "      sy: StaticText { text:' y =' }," +
    "      ey: EditText { preferredSize:[70, 20] }," +
    "      sz: StaticText { text:' z =' }," +
    "      ez: EditText { preferredSize:[70, 20] }" +
    "    }" +
    "  }," +
    "  buttonGrp: Group {" +
    "    alignment:['fill','top']," +
    "    okBtn: Button { text:'OK', alignment:['center','center'], properties:{name:'ok'} }," +
    "    cancelBtn: Button { text:'Cancel', alignment:['center','center'], properties:{name:'cancel'} }" +
    "  }" +
    "}";
          
  var dlg = new Window(dlgRes, "アクティブカメラから出力します.");

  dlg.contentGrp.scaleGrp.e.text = scale;
  dlg.contentGrp.offsetGrp.ex.text = ox;
  dlg.contentGrp.offsetGrp.ey.text = oy;
  dlg.contentGrp.offsetGrp.ez.text = oz;

  if(dlg.show() != 1) break;

  scale = dlg.contentGrp.scaleGrp.e.text.replace(/\s+/, "");
  if(scale.length == 0){
    alert("スケールが入力されていません。", vmdExpObj.getScriptName());
    continue;
  }
  if(!isFinite(scale) || scale <= 0){
    alert("スケールには0より大きい数値を入力してください。", vmdExpObj.getScriptName());
    continue;
  }

  ox = dlg.contentGrp.offsetGrp.ex.text.replace(/\s+/, "");
  oy = dlg.contentGrp.offsetGrp.ey.text.replace(/\s+/, "");
  oz = dlg.contentGrp.offsetGrp.ez.text.replace(/\s+/, "");
  
  if(ox.length == 0 || oy.length == 0 || oz.length == 0){
    alert("位置の基準が入力されていません。", vmdExpObj.getScriptName());
    continue;
  }
  if(!isFinite(ox) || !isFinite(oy) || !isFinite(oz)){
    alert("位置の基準には数値を入力してください。", vmdExpObj.getScriptName());
    continue;
  }

  var targetFile = File.saveDialog("名前をつけて保存", ["*" + EXTENSION_VMD,"*.txt","*.*"]);
  
  if(targetFile != null){
    app.settings.saveSetting(vmdExpObj.getScriptURLName(),"SCALE", scale);
    app.settings.saveSetting(vmdExpObj.getScriptURLName(),"X_POINT", ox);
    app.settings.saveSetting(vmdExpObj.getScriptURLName(),"Y_POINT", oy);
    app.settings.saveSetting(vmdExpObj.getScriptURLName(),"Z_POINT", oz);

    activeCameraToVMD(myComp, parseFloat(scale) / 100, [parseFloat(ox), parseFloat(oy), parseFloat(oz)], targetFile);
  }

  break;
}


function toRadians(deg){
  return deg / 180 * Math.PI;
}

function toDegrees(rad){
  return rad * 180 / Math.PI;
}

function signum(value){
  if(value > 0) return 1;
  if(value < 0) return -1;
  return value;
}

function transformNormal(m, v3){
  var v4 = [v3[0], v3[1], v3[2], 0];
  mat4.multiplyVec4(m, v4);
  v3[0] = v4[0];
  v3[1] = v4[1];
  v3[2] = v4[2];
}

/*
float型の浮動小数点数（32ビット）をビット単位で等しいint型（32ビット）の値に変換する
*/
function floatToIntBits(value){
  if(value == Number.POSITIVE_INFINITY) return 0x7f800000;
  if(value == Number.NEGATIVE_INFINITY) return 0xff800000;
  if(isNaN(value)) return 0x7fc00000;

  var s;
  if(value < 0){
    s = 1;
    value *= -1;
  }else{
    s = 0;
  }

  var exp = Math.floor(Math.log(value) / Math.LN2);

  if(exp >= 128) return s ? 0xff800000 : 0x7f800000; 

  var frac;
  if(exp <= -127){
    frac = value * Math.pow(2, 149);
    exp = 0;
  }else{
    frac = value * Math.pow(2, 23 - exp);
    exp += 127;
  }

  return (s<<31) | (exp<<23) | (Math.round(frac)&0x007fffff);
}

function writeFile2Int(targetFile, value){
  if(targetFile.toString().indexOf(EXTENSION_VMD) != -1){
    for(var i = 0; i < 4; ++i){
      targetFile.write(String.fromCharCode((value >> (i*8)) & 0xff));
    }
  }else{
    targetFile.writeln(value);
  }
}

function writeFile2Float(targetFile, value){
  if(targetFile.toString().indexOf(EXTENSION_VMD) != -1){
    writeFile2Int(targetFile, floatToIntBits(value));
  }else{
    writeFile2Int(targetFile, value);
  }
}

function calcCameraMatrix(camera, flipZ){
  var l = flipZ ? -1 : 1;
  var rx = camera.property("ADBE Transform Group").property("ADBE Rotate X").value;
  var ry = camera.property("ADBE Transform Group").property("ADBE Rotate Y").value;
  var rz = camera.property("ADBE Transform Group").property("ADBE Rotate Z").value;
  var or = camera.property("ADBE Transform Group").property("ADBE Orientation").value;
  var ps = camera.property("ADBE Transform Group").property("ADBE Position").value;

  var m = mat4.create();
  mat4.identity(m);

  // 回転
  mat4.rotate(m, -toRadians(rz), [0, 0, 1]);
  mat4.rotate(m, -toRadians(ry), [0, l, 0]);
  mat4.rotate(m, -toRadians(rx), [l, 0, 0]);

  // 方向
  mat4.rotate(m, -toRadians(or[2]), [0, 0, 1]);
  mat4.rotate(m, -toRadians(or[1]), [0, l, 0]);
  mat4.rotate(m, -toRadians(or[0]), [l, 0, 0]);

  switch (camera.autoOrient){
    case AutoOrientType.CAMERA_OR_POINT_OF_INTEREST:
      // 目標点
      var pi = camera.property("ADBE Transform Group").property("ADBE Anchor Point").value;
      var dx = pi[0] - ps[0];
      var dy = pi[1] - ps[1];
      var dz = pi[2] - ps[2];
      mat4.rotate(m,  Math.atan2(dy, Math.sqrt(dx*dx+dz*dz)), [l, 0, 0]);
      mat4.rotate(m, -Math.atan2(dx, dz), [0, l, 0]);
      break;

      case AutoOrientType.ALONG_PATH:
        // FIXME
        break;
  }

  // 位置
  mat4.translate(m, [-ps[0], -ps[1], -ps[2]*l]);

  // Z軸を反転
  if(flipZ) mat4.scale(m, [1, 1, -1]);

  return m;
}

function calcLayerMatrixInverse(ap, sc, rx, ry, rz, or, pi, ps){
  var m = mat4.create();
  mat4.identity(m);

  // アンカーポイント
  mat4.translate(m, [ap[0], ap[1], ap[2]]);

  // 拡大縮小
  mat4.scale(m, [100/sc[0], 100/sc[1], 100/sc[2]]);

  // 回転
  mat4.rotate(m, -toRadians(rz), [0, 0, 1]);
  mat4.rotate(m, -toRadians(ry), [0, 1, 0]);
  mat4.rotate(m, -toRadians(rx), [1, 0, 0]);

  // 方向
  mat4.rotate(m, -toRadians(or[2]), [0, 0, 1]);
  mat4.rotate(m, -toRadians(or[1]), [0, 1, 0]);
  mat4.rotate(m, -toRadians(or[0]), [1, 0, 0]);

  // 目標点
  if(pi != null){
    var dx = pi[0] - ps[0];
    var dy = pi[1] - ps[1];
    var dz = pi[2] - ps[2];
    mat4.rotate(m,  Math.atan2(dy, Math.sqrt(dx*dx+dz*dz)), [1, 0, 0]);
    mat4.rotate(m, -Math.atan2(dx, dz), [0, 1, 0]);
  }

  // 位置
  mat4.translate(m, [-ps[0], -ps[1], -ps[2]]);

  return m;
}

function multCameraMatrix(camera, m, threeD){
  if(threeD){
    mat4.multiply(m, calcCameraMatrix(camera, false));
  }else{
    // 2Dレイヤーの親にカメラを指定したとき、
    // 目標点の値がアンカーポイントとして解釈されていると思われる動作をする。

    var pi = camera.property("ADBE Transform Group").property("ADBE Anchor Point").value;
    var ap = [pi[0], pi[1], 0];
    var rz = camera.property("ADBE Transform Group").property("ADBE Rotate Z").value;
    var po = camera.property("ADBE Transform Group").property("ADBE Position").value;
    po[2] = 0;

    mat4.multiply(m, calcLayerMatrixInverse(ap, [100, 100, 100], 0, 0, rz, [0, 0, 0], null, po));
  }
}

function multLightMatrixInverse(light, m, threeD){
  var ap = [0, 0, 0];
  var sc = [100, 100, 100];
  var rx;
  var ry;
  var rz;
  var or;
  var pi = null;
  var ps = light.property("ADBE Transform Group").property("ADBE Position").value;

  var lightType = light.lightType;

  // FIXME AEのスクリプト内でライトの種類を取得する手段が無い？
  // if(true /* 平行またはスポットの場合 */){
  if(lightType == LightType.PARALLEL || lightType == LightType.SPOT){
    switch (light.autoOrient){
      case AutoOrientType.CAMERA_OR_POINT_OF_INTEREST:
        pi = light.property("ADBE Transform Group").property("ADBE Anchor Point").value;
        break;

      case AutoOrientType.ALONG_PATH:
        // FIXME
        break;
    }
  }

  if(threeD){
    rx = light.property("ADBE Transform Group").property("ADBE Rotate X").value;
    ry = light.property("ADBE Transform Group").property("ADBE Rotate Y").value;
    rz = light.property("ADBE Transform Group").property("ADBE Rotate Z").value;
    or = light.property("ADBE Transform Group").property("ADBE Orientation").value;
  }else{
    // 2Dレイヤーの親にライトを指定したとき、
    // 目標点の値がアンカーポイントとして解釈されていると思われる動作をする。

    if(pi != null){
      ap = [pi[0], pi[1], 0];
      pi = null;
    }
    rx = 0;
    ry = 0;
    rz = light.property("ADBE Transform Group").property("ADBE Rotate Z").value;
    or = [0, 0, 0];
    ps[2] = 0;
  }

  mat4.multiply(m, calcLayerMatrixInverse(ap, sc, rx, ry, rz, or, pi, ps));
}

function multAVLayerMatrixInverse(layer, m, threeD){
  if(!layer.hasVideo){
    return;
  }

  var ap = layer.property("ADBE Transform Group").property("ADBE Anchor Point").value;
  var sc = layer.property("ADBE Transform Group").property("ADBE Scale").value;
  var rx;
  var ry;
  var rz;
  var or;
  var ps = layer.property("ADBE Transform Group").property("ADBE Position").value;

  if(threeD){
    rx = layer.property("ADBE Transform Group").property("ADBE Rotate X").value;
    ry = layer.property("ADBE Transform Group").property("ADBE Rotate Y").value;
    rz = layer.property("ADBE Transform Group").property("ADBE Rotate Z").value;
    or = layer.property("ADBE Transform Group").property("ADBE Orientation").value;
  }else{
    ap[2] = 0;
    sc[2] = 100;
    rx = 0;
    ry = 0;
    rz = layer.threeDLayer ? layer.property("ADBE Transform Group").property("ADBE Rotate Z").value : layer.property("ADBE Transform Group").property("ADBE Rotate Z").value;
    or = [0, 0, 0];
    ps[2] = 0;
  }

  mat4.multiply(m, calcLayerMatrixInverse(ap, sc, rx, ry, rz, or, null, ps));
}

function multLayerMatrixInverse(layer, m, threeD){
  if(layer instanceof CameraLayer){
    multCameraMatrix(layer, m, threeD);
  }else if(layer instanceof LightLayer){
    multLightMatrixInverse(layer, m, threeD);
  }else if(layer instanceof AVLayer){
    multAVLayerMatrixInverse(layer, m, threeD &= layer.threeDLayer);
  }else{
    return;    // FIXME CameraLayer, LightLayer, AVLayer 以外の型はある？
  }

  if(layer.parent != null){
    multLayerMatrixInverse(layer.parent, m, threeD);
  }
}

function activeCameraToVMD(myComp, scale, offset, targetFile){
  if(targetFile.toString().indexOf(EXTENSION_VMD) != -1){
    targetFile.encoding = "BINARY";
  }
  targetFile.open("w");

  // ヘッダ部分はとりあえずゼロで埋めておき、後で書き直す。
  for(var i = 0; i < 62; ++i){
    targetFile.write('\0');
  }

  var origTime = myComp.time;
  var numFrames = myComp.duration / myComp.frameDuration;
  var writtenFrameCount = 0;

  // 開始時のアクティブカメラ
  myComp.time = 0;
  var camera = myComp.activeCamera;
  // 入力
  for(var idx = 0; idx <= numFrames; idx++){
    camera = myComp.activeCamera;
      
    if(camera == null){
      continue;
    }

    var zoom = camera.property("ADBE Camera Options Group").property("ADBE Camera Zoom").value;
    var viewingAngle = 2 * Math.atan(0.5 * myComp.height / zoom);
    var m = calcCameraMatrix(camera, true);
    if(camera.parent != null){
      multLayerMatrixInverse(camera.parent, m, true);
    }
    mat4.inverse(m);

    // カメラの位置
    var pc = [0, 0, 0];
    mat4.multiplyVec3(m, pc);
    // 仮の距離
    var length = -myComp.height / (2 * Math.tan(0.5 * viewingAngle));
    // 目標点
    var po = [0, 0, length];
    mat4.multiplyVec3(m, po);
    // カメラから目標点へのベクトル
    var v = [0, 0, 0];
    vec3.subtract(po, pc, v);    
    // 距離 (mの変換にスケーリングが含まれている場合は、仮の距離と違う値になる)
    length = -vec3.length(v);
    // 回転Y,X
    var ry = Math.atan2(v[0], v[2]);
    var rx = -Math.atan2(v[1], Math.sqrt(v[0]*v[0]+v[2]*v[2]));
    // 回転Z
    var mry = mat4.create();
    var mrx = mat4.create();
    mat4.identity(mry);
    mat4.identity(mrx);
    mat4.rotate(mry, ry, [0, 1, 0]);
    mat4.rotate(mrx, rx, [1, 0, 0]);

    var mryx = mat4.create();
    mat4.multiply(mry, mrx, mryx);

    var n1 = [0, 1, 0];
    var n2 = [0, 1, 0];
    var n3 = [0, 0, 0];
    var n4 = [0, 0, 1];
    transformNormal(mryx, n1);
    transformNormal(m, n2);
    vec3.cross(n1, n2, n3);
    transformNormal(mryx, n4);

    var dot12 = vec3.dot(n1, n2);
    var dot34 = vec3.dot(n3, n4);
    var len1 = vec3.length(n1);
    var len2 = vec3.length(n2);
    var rz = Math.acos(Math.min(Math.max(dot12 / (len1 * len2), -1), 1)) * signum(dot34);

    writeFile2Int(targetFile, idx-1);　// キーフレーム番号
    writeFile2Float(targetFile,  length * scale); // scale(カメラ距離)
    writeFile2Float(targetFile,  (po[0] - offset[0]) * scale); // x座標
    writeFile2Float(targetFile, -(po[1] - offset[1]) * scale); // y座標
    writeFile2Float(targetFile,  (po[2] - offset[2]) * scale); // z座標
    writeFile2Float(targetFile,  rx); // x回転
    writeFile2Float(targetFile, -ry); // y回転
    writeFile2Float(targetFile,  rz); // z回転
    
    if(targetFile.toString().indexOf(EXTENSION_VMD) != -1){
      for(var j = 0; j < 12; ++j){
        targetFile.write(String.fromCharCode(0x14));
        targetFile.write(String.fromCharCode(0x6b));
      }
    }
    writeFile2Int(targetFile, Math.round(toDegrees(viewingAngle)));
    targetFile.write('\0');

    myComp.time = idx * myComp.frameDuration;
    ++writtenFrameCount;
  }
    
  myComp.time = origTime;

  writeFile2Int(targetFile, 0);                                     // ライトデータの数
  writeFile2Int(targetFile, 0);                                     // セルフシャドウデータの数
  targetFile.seek(0);
  targetFile.write("Vocaloid Motion Data 0002\0");
  targetFile.write("JKLM");                                         // MMDから書き出したVMDを見ると"JKLM"と入っているので。
  if(targetFile.toString().indexOf(EXTENSION_VMD) != -1){
    targetFile.write("\u0083\u004a\u0083\u0081\u0083\u0089");     // "カメラ・照明"
    targetFile.write("\u0081\u0045\u008f\u00c6\u0096\u00be\0");
    targetFile.write("on Data");                                  // MMDから書き出したVMDを見ると"on Data"と入っているので。
  }else{
    targetFile.writeln("カメラ・照明");        // "カメラ・照明"
    targetFile.writeln("\u0081\u0045\u008f\u00c6\u0096\u00be\0");
    targetFile.writeln("on Data");                                // MMDから書き出したVMDを見ると"on Data"と入っているので。
  }
  writeFile2Int(targetFile, 0);                                     // モーションデータの数
  writeFile2Int(targetFile, 0);                                     // スキンデータの数
  writeFile2Int(targetFile, writtenFrameCount);                     // カメラデータの数
  targetFile.close();
}


// TODO ライトの処理
function targetCompToVMD(myComp, scale, offset, targetFile){
  if(targetFile.toString().indexOf(EXTENSION_VMD) != -1){
    targetFile.encoding = "BINARY";
  }
  targetFile.open("w");

  // ヘッダ部分はとりあえずゼロで埋めておき、後で書き直す。
  for(var i = 0; i < 62; ++i){
    targetFile.write('\0');
  }

  var origTime = myComp.time;
  var numFrames = myComp.duration / myComp.frameDuration;
  var writtenFrameCount = 0;

  // 開始時のアクティブカメラ
  myComp.time = 0;
  var targetCamera = myComp.activeCamera;
  var targetLight  = myComp.selectedLayers[0];

  // 入力
  for(var idx = 0; idx <= numFrames; idx++){
    targetCamera = myComp.activeCamera;
    myComp.time = idx * myComp.frameDuration;
    
    if(targetCamera == null){
      continue;
    }

    var zoom = targetCamera.property("ADBE Camera Options Group").property("ADBE Camera Zoom").value;
    var viewingAngle = 2 * Math.atan(0.5 * myComp.height / zoom);

    var m = calcCameraMatrix(targetCamera, true);
    if(targetCamera.parent != null){
        multLayerMatrixInverse(targetCamera.parent, m, true);
    }
    mat4.inverse(m);

    // カメラの位置
    var pc = [0, 0, 0];
    mat4.multiplyVec3(m, pc);
    // 仮の距離
    var length = -myComp.height / (2 * Math.tan(0.5 * viewingAngle));
    // 目標点
    var po = [0, 0, length];
    mat4.multiplyVec3(m, po);
    // カメラから目標点へのベクトル
    var v = [0, 0, 0];
    vec3.subtract(po, pc, v);    
    // 距離 (mの変換にスケーリングが含まれている場合は、仮の距離と違う値になる)
    length = -vec3.length(v);
    // 回転Y,X
    var ry = Math.atan2(v[0], v[2]);
    var rx = -Math.atan2(v[1], Math.sqrt(v[0]*v[0]+v[2]*v[2]));
    // 回転Z
    var mry = mat4.create();
    var mrx = mat4.create();
    mat4.identity(mry);
    mat4.identity(mrx);
    mat4.rotate(mry, ry, [0, 1, 0]);
    mat4.rotate(mrx, rx, [1, 0, 0]);

    var mryx = mat4.create();
    mat4.multiply(mry, mrx, mryx);

    var n1 = [0, 1, 0];
    var n2 = [0, 1, 0];
    var n3 = [0, 0, 0];
    var n4 = [0, 0, 1];
    transformNormal(mryx, n1);
    transformNormal(m, n2);
    vec3.cross(n1, n2, n3);
    transformNormal(mryx, n4);

    var dot12 = vec3.dot(n1, n2);
    var dot34 = vec3.dot(n3, n4);
    var len1 = vec3.length(n1);
    var len2 = vec3.length(n2);
    var rz = Math.acos(Math.min(Math.max(dot12 / (len1 * len2), -1), 1)) * signum(dot34);

    writeFile2Int(targetFile, idx-1);　// キーフレーム番号
    writeFile2Float(targetFile,  length * scale); // scale(カメラ距離)
    writeFile2Float(targetFile,  (po[0] - offset[0]) * scale); // x座標
    writeFile2Float(targetFile, -(po[1] - offset[1]) * scale); // y座標
    writeFile2Float(targetFile,  (po[2] - offset[2]) * scale); // z座標
    writeFile2Float(targetFile,  rx); // x回転
    writeFile2Float(targetFile, -ry); // y回転
    writeFile2Float(targetFile,  rz); // z回転
    
    if(targetFile.toString().indexOf(EXTENSION_VMD) != -1){
      for(var j = 0; j < 12; ++j){
        targetFile.write(String.fromCharCode(0x14));
        targetFile.write(String.fromCharCode(0x6b));
      }
    }
    writeFile2Int(targetFile, Math.round(toDegrees(viewingAngle)));
    targetFile.write('\0');

    ++writtenFrameCount;
  }
    

  myComp.time = origTime;

  writeFile2Int(targetFile, writtenFrameCount);                    // ライトデータの数
  writeFile2Int(targetFile, 0);                                    // セルフシャドウデータの数
  targetFile.seek(0);
  targetFile.write("Vocaloid Motion Data 0002\0");
  targetFile.write("JKLM");                                        // MMDから書き出したVMDを見ると"JKLM"と入っているので。
  if(targetFile.toString().indexOf(EXTENSION_VMD) != -1){
    targetFile.write("\u0083\u004a\u0083\u0081\u0083\u0089");    // "カメラ・照明"
    targetFile.write("\u0081\u0045\u008f\u00c6\u0096\u00be\0");
    targetFile.write("on Data");                                 // MMDから書き出したVMDを見ると"on Data"と入っているので。
  }else{
    targetFile.writeln("カメラ・照明");                              // "カメラ・照明"
    targetFile.writeln("\u0081\u0045\u008f\u00c6\u0096\u00be\0");
    targetFile.writeln("on Data");                               // MMDから書き出したVMDを見ると"on Data"と入っているので。
  }
  writeFile2Int(targetFile, 0);                                    // モーションデータの数
  writeFile2Int(targetFile, 0);                                    // スキンデータの数
  writeFile2Int(targetFile, 0);                                    // カメラデータの数
  targetFile.close();
}

}).call(this);
